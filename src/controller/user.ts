import { Request as ExpressRequest, Response } from "express";
import { errorResponse, successResponse } from "../utils/responses";
import { HttpStatusCodes } from "../utils/httpStatusCodes";
import UserService from "../services/UserService";
import { RegisterInfo, UserPayload } from "../utils/types";
import { PayloadComplete } from "../interfaces/interfaces";

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

            return successResponse(res, HttpStatusCodes.OK, "Usuario logueado correctamente!", token);
        } catch(e) {
            console.error(e);
            return errorResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, "Error al intentar iniciar sesión");
        }
    }

    static async update(req: Request, res: Response) {
        const user = req.user;
        return successResponse(res, HttpStatusCodes.OK, "Acción de actualizar usuario", user);
    }
}

export default UserController;