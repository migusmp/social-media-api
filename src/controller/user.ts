import { Request, Response } from "express";
import bcrypt from 'bcrypt';

import { errorResponse, successResponse } from "../utils/responses";
import { HttpStatusCodes } from "../utils/httpStatusCodes";
import UserService from "../services/UserService";
import { RegisterInfo } from "../utils/types";


class UserController {

    public static async register(req: Request, res: Response) {

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
            const userInfo: RegisterInfo = {
                name,
                nick,
                email,
                password
            }

            // Hasheamos la contraseña
            const hashedPwd = bcrypt.hashSync(password, 10);
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

}

export default UserController;