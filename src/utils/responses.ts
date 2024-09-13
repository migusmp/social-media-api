import { Response } from "express"
import { ErrorsRegister } from "./types"

// Funciones para enviar respuestas a los clientes

export const successResponse = async (res: Response, statusCode: number, msg: string, data?: object | string, length?: object | string | number) => {
    return res.status(statusCode).send({
        status: "success",
        message: msg,
        data,
        length
    })
}

export const errorResponse = async (res: Response, statusCode: number, msg: string | ErrorsRegister) => {
    return res.status(statusCode).send({
        status: "error",
        message: msg
    })
}