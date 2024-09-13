import { Request, Response } from 'express';
import { errorResponse, successResponse } from '../utils/responses';
import { HttpStatusCodes } from '../utils/httpStatusCodes';
import { PayloadComplete } from '../interfaces/interfaces';
import FollowService from '../services/FollowService';

interface ExpressRequest extends Request  {
    user?: PayloadComplete
}

class FollowsController {
    static async test(_req: Request, res: Response) {
        return successResponse(res, HttpStatusCodes.ACCEPTED, "Ruta de follows funcionando correctamente");
    }

    static async follow(req: ExpressRequest, res: Response): Promise<object> {
        const user = req.user;
        const { userFollowdId } = req.params;
        if (!userFollowdId || !user) {
            return errorResponse(res, HttpStatusCodes.NOT_FOUND, "El usuario no existe");
        }

        try {
            // Comprobar que el usuario no lo haya seguido previamente
            const verify = await FollowService.checkUserFollow(user.id, userFollowdId);
            if (verify != true) {
                return errorResponse(res, HttpStatusCodes.CREATED, "Ya sigues ha este usuario");
            }

            // Guardamos el follow en la BBDD
            const saveFollow = await FollowService.follow(user.id, userFollowdId);
            if (!saveFollow) {
                return errorResponse(res, HttpStatusCodes.ACCEPTED, "Error al seguir al usuario");
            }

            return successResponse(res, HttpStatusCodes.OK, "Usuario seguido correctamente");
        } catch(e) {
            console.error(e);
            return errorResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, "Error al seguir al usuario, INTERNAL SERVER ERROR");
        }
    }

    static async unfollow(req: ExpressRequest, res: Response): Promise<object> {
        const user = req.user;
        const { userUnfollowed } = req.params;
        if (!userUnfollowed || !user) {
            return errorResponse(res, HttpStatusCodes.BAD_REQUEST, "Debes introducir el id del usuario que quieres dejar de seguir al final de la URL");
        }
        try {
            // Comprobar que el usuario seguía al usuario que quiere dejar de seguir
            const checkFollow = await FollowService.checkUserFollow(user.id, userUnfollowed);
            if (checkFollow === true || checkFollow === false) {
                return errorResponse(res, HttpStatusCodes.BAD_REQUEST, "No sigues a este usuario");
            }

            // Si lo sigue, eliminamos el follow correspondiente
            const unfollow = await FollowService.unfollow(user.id, userUnfollowed);
            if (unfollow != true) return errorResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, "Error al dejar de seguir al usuario");

            return successResponse(res, HttpStatusCodes.OK, "Unfollowed");
        } catch(e) {
            console.error(e);
            return errorResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, "Error al dejar de seguir al usuario, INTERNAL SERVER ERROR");
        }
    }
}

export default FollowsController;