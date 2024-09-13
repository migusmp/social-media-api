import { PayloadComplete } from "../interfaces/interfaces";
import { HttpStatusCodes } from "../utils/httpStatusCodes";
import { Request as ExpressRequest , Response, NextFunction } from "express";
import { errorResponse } from "../utils/responses";
import jwt from 'jwt-simple';
import moment from "moment";

const key = process.env.SECRET_PAYLOAD_KEY;

export interface Request extends ExpressRequest {
    user?: PayloadComplete
}

const auth = async (req: Request, res: Response, next: NextFunction ): Promise<object | void> => {
    if (!key) return;
    if (!req.cookies.auth) {
        return errorResponse(res, HttpStatusCodes.UNAUTHORIZED, "Debes introducir la cabecera de autenticación");
    }
    try {
        // Limpiar el token
        let token = req.cookies.auth.replace(/['"']+/g, '');

        // Verificamos que el token es válido
        let payload:PayloadComplete = await jwt.decode(token, key, false, "HS256");
        if (payload.exp <= moment().unix()) {
            return errorResponse(res, HttpStatusCodes.UNAUTHORIZED, "invalid token");
        }

        req.user = payload;

    } catch(e) {
        console.error(e);
        return errorResponse(res, HttpStatusCodes.UNAUTHORIZED, "No puedes acceder a esta función del servidor :(");
    }

    next()
}

export default {
    auth
}