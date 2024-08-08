import { Request, Response } from "express";

class UserController {

    public static async register(_req: Request, res: Response) {
        return res.status(200).send({
            status: "success",
            message: "Ruta de registrar usuarios funcionando correctamente"
        })
    }
}

export default UserController;