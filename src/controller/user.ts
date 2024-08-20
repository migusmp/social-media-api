import { Request as ExpressRequest, Response } from "express";
import { errorResponse, successResponse } from "../utils/responses";
import { HttpStatusCodes } from "../utils/httpStatusCodes";
import UserService from "../services/UserService";
import { RegisterInfo, UserPayload } from "../utils/types";
import { PayloadComplete, UpdateData } from "../interfaces/interfaces";
import fs from 'node:fs';

interface Request extends ExpressRequest {
    user?: PayloadComplete
}

class UserController {

    static async register(req: Request, res: Response): Promise<object> {

        const { name, nick, email, password }: RegisterInfo = req.body;
        // Nos aseguramos de que el usuario envía todos los datos
        if (!name || !nick || !email || !password) {
            return errorResponse(res, HttpStatusCodes.NOT_FOUND, "Falta información para registrar al usuario")
        }

        const checkData = await UserService.verifyRegisterData(name, nick, email, password); // Verificamos la información proporcionada por el usuario
        if (checkData != true) return errorResponse(res, HttpStatusCodes.BAD_REQUEST, checkData);

        // Verificamos que el usuario ya exista en la BBDD
        const checkUser = await UserService.checkIfUserExist(nick, email);
        if (checkUser) return errorResponse(res, HttpStatusCodes.SERVICE_UNAVAILABLE, "Este usuario ya existe!");
        try {
            const userInfo: RegisterInfo = { name, nick, email, password }
            // Hasheamos la contraseña
            const hashedPwd = await UserService.hashPassword(password);
            if (!hashedPwd) return errorResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, "Error hashear la password");

            userInfo.password = hashedPwd;

            // Guardamos al usuario en la base de datos
            const userSaved = await UserService.saveUser(userInfo);
            if (!userSaved) return errorResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, "Error al registrar al usuario")

            return successResponse(res, HttpStatusCodes.CREATED, "Usuario registrado correctamente");
        } catch(e) {
            console.error(e);
            return errorResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, "Error al registrar el usuario :(")
        }
    }

    static async login(req: Request, res: Response): Promise<object> {
        const { nick, password } = req.body;
        if (!nick || !password) return errorResponse(res, HttpStatusCodes.BAD_REQUEST, "Faltan datos por enviar");

        try {
            // Verificar que el usuario existe
            const userExist = await UserService.findUserByNick(nick);
            if (!userExist) return errorResponse(res, HttpStatusCodes.BAD_REQUEST, "El usuario no existe");

            // Comprobar contraseña
            const verifyPwd = await UserService.verifyPassword(password, userExist.password);
            if (!verifyPwd) return errorResponse(res, HttpStatusCodes.BAD_REQUEST, "Contraseña incorrecta");

            // Crear el token
            const token = await UserService.generateToken(userExist as UserPayload);
            if (!token) return errorResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, "Ups ha ocurrido un error al intentar iniciar sesión :(");

            // Ponemos en la cookie el token que contiene la información del usuario logueado
            res.cookie('auth', token, {
                httpOnly: true, // Esta cookie solo será accesible por el servidor
                sameSite: 'strict', // Limita el envío de la cookie en solicitudes de terceros
                maxAge: 24 * 60 * 60 * 1000 // La cookie expira en 1 día
            });

            return successResponse(res, HttpStatusCodes.OK, "Usuario logueado correctamente!", token);
        } catch(e) {
            console.error(e);
            return errorResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, "Error al intentar iniciar sesión");
        }
    }

    static async update(req: Request, res: Response) {
        const user = req.user;
        if (!user) return;

        const info: UpdateData = req.body;

        if (!info.description && !info.name && !info.nick && !info.password) {
            return errorResponse(res, HttpStatusCodes.BAD_REQUEST, "No data to update profile");
        }

        try {
            // Comprobamos que si quiere actualizar el nick, este no lo tenga ya asignado un usuario.
            if (info.nick) {
                const checkNewNick = await UserService.findUserByNick(info.nick);
        
                if (checkNewNick != false) {
                    return errorResponse(res, HttpStatusCodes.OK, "this nick is already used");
                }
            }

            if (info.password) {
                const newPassword = await UserService.hashPassword(info.password);
                if (!newPassword) return errorResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, "Error al realizar la operación");
                info.password = newPassword;
            }

            const update = await UserService.updateUser(user?.id, info);
            if (!update) {
                return errorResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, "Error al actualizar la información del usuario");
            }
            
            return successResponse(res, HttpStatusCodes.OK, "User updated!");

        } catch(e) {
            console.error(e);
            return errorResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, "Error al actualizar el usuario, INTERNAL SERVER ERROR");
        }
    }

    static async upload(req: Request, res: Response): Promise<object | void> {
        const user = req.user;
        if (!user) return errorResponse(res, HttpStatusCodes.BAD_REQUEST, "user identity err");
        if (!req.file) {
            return errorResponse(res, HttpStatusCodes.BAD_REQUEST, "You need introduce an image");
        }
        // Obtenemos la extensión del archivo subido por el cliente
        let image = req.file.originalname;
        let imageSplit = image.split("\.");
        let imageExtension = imageSplit[1];

        if (imageExtension !== "jpeg" && imageExtension !== "jpg" && imageExtension !== "png" && imageExtension !== "gif") {
            // Eliminamos la imágen
            let imagePath = req.file.path;
            fs.unlinkSync(imagePath);

            return errorResponse(res, HttpStatusCodes.BAD_REQUEST, "Invalid image format");
        }

        let userImageUpdate = await UserService.updateUserImage(user.id, req.file.filename); // Actualizamos la imagen en la BBDD

        if (!userImageUpdate) {
            return errorResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, "Error al actualizar la imagen de perfil");
        }

        return successResponse(res, HttpStatusCodes.OK, "Image", userImageUpdate);
    }

    static async usersList(req: Request, res: Response): Promise<object> {
        // Página que se mostrará por defecto
        let page: number = 1;

        if (req.params.page) {
            page = parseInt(req.params.page);
        }
        try {
            const options = {
                page,
                limit: 2,
                select: "nick name _id"
            }
            const users = await UserService.usersList(options); // Listamos los usuarios
            return successResponse(res, HttpStatusCodes.OK, "App users list:", users);
        } catch(e) {
            console.error(e);
            return errorResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, "Error al obtener los usuarios de la App, INTERNAL SERVER ERROR");
        }
    }
}

export default UserController;