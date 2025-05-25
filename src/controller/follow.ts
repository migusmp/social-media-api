import { Request, Response } from 'express';
import { errorResponse, successResponse } from '../utils/responses';
import { HttpStatusCodes } from '../utils/httpStatusCodes';
import { PayloadComplete } from '../interfaces/interfaces';
import FollowService from '../services/FollowService';

interface ExpressRequest extends Request {
    user?: PayloadComplete
}

class FollowsController {
    static async test(_req: Request, res: Response) {
        return successResponse(res, HttpStatusCodes.ACCEPTED, "Follow route working correctly");
    }

    static async follow(req: ExpressRequest, res: Response): Promise<object> {
        const user = req.user;
        const { userId } = req.params;

        if (!userId || !user) {
            return errorResponse(res, HttpStatusCodes.NOT_FOUND, "User does not exist");
        }

        try {
            // Check if the user is already following the target user
            const verify = await FollowService.checkUserFollow(user.id, userId);
            if (verify !== true) {
                return errorResponse(res, HttpStatusCodes.CREATED, "You are already following this user");
            }

            // Save the follow to the database
            const saveFollow = await FollowService.follow(user.id, userId);
            if (!saveFollow) {
                return errorResponse(res, HttpStatusCodes.ACCEPTED, "Error following the user");
            }

            return successResponse(res, HttpStatusCodes.OK, "User followed successfully");
        } catch (e) {
            console.error(e);
            return errorResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, "Error following the user, INTERNAL SERVER ERROR");
        }
    }

    static async unfollow(req: ExpressRequest, res: Response): Promise<object> {
        const user = req.user;
        const { userId } = req.params;

        if (!userId || !user) {
            return errorResponse(res, HttpStatusCodes.BAD_REQUEST, "You must provide the ID of the user you want to unfollow at the end of the URL");
        }

        try {
            // Check if the user is currently following the user to unfollow
            const checkFollow = await FollowService.checkUserFollow(user.id, userId);
            if (checkFollow === true || checkFollow === false) {
                return errorResponse(res, HttpStatusCodes.BAD_REQUEST, "You are not following this user");
            }

            // If they are following, remove the follow entry
            const unfollow = await FollowService.unfollow(user.id, userId);
            if (unfollow !== true) {
                return errorResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, "Error unfollowing the user");
            }

            return successResponse(res, HttpStatusCodes.OK, "Unfollowed");
        } catch (e) {
            console.error(e);
            return errorResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, "Error unfollowing the user, INTERNAL SERVER ERROR");
        }
    }
}

export default FollowsController;
