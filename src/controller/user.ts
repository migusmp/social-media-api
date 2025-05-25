import { Request as ExpressRequest, Response } from "express";
import { errorResponse, successResponse } from "../utils/responses";
import { HttpStatusCodes } from "../utils/httpStatusCodes";
import UserService from "../services/UserService";
import { RegisterInfo, UserPayload } from "../utils/types";
import { PayloadComplete, UpdateData } from "../interfaces/interfaces";
import fs from 'node:fs';
import FollowService from "../services/FollowService";

interface Request extends ExpressRequest {
    user?: PayloadComplete
}

class UserController {

    static async register(req: Request, res: Response): Promise<object> {
        const { name, nick, email, password }: RegisterInfo = req.body;
        // Ensure the user sends all required data
        if (!name || !nick || !email || !password) {
            return errorResponse(res, HttpStatusCodes.NOT_FOUND, "Missing information to register the user");
        }

        const checkData = await UserService.verifyRegisterData(name, nick, email, password); // Verify the information provided by the user
        if (checkData != true) return errorResponse(res, HttpStatusCodes.BAD_REQUEST, checkData);

        // Check if the user already exists in the DB
        const checkUser = await UserService.checkIfUserExist(nick, email);
        if (checkUser) return errorResponse(res, HttpStatusCodes.SERVICE_UNAVAILABLE, "This user already exists!");
        try {
            const userInfo: RegisterInfo = { name, nick, email, password }
            // Hash the password
            const hashedPwd = await UserService.hashPassword(password);
            if (!hashedPwd) return errorResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, "Error hashing the password");

            userInfo.password = hashedPwd;

            // Save the user in the database
            const userSaved = await UserService.saveUser(userInfo);
            if (!userSaved) return errorResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, "Error registering the user")

            return successResponse(res, HttpStatusCodes.OK, "User registered successfully");
        } catch (e) {
            console.error(e);
            return errorResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, "Error registering the user :(")
        }
    }

    static async login(req: Request, res: Response): Promise<object> {
        const { nick, password } = req.body;
        if (!nick || !password) return errorResponse(res, HttpStatusCodes.BAD_REQUEST, "Missing data to send");

        try {
            // Verify that the user exists
            const userExist = await UserService.findUserByNick(nick);
            if (!userExist) return errorResponse(res, HttpStatusCodes.BAD_REQUEST, "The user does not exist");

            // Check password
            const verifyPwd = await UserService.verifyPassword(password, userExist.password);
            if (!verifyPwd) return errorResponse(res, HttpStatusCodes.BAD_REQUEST, "Incorrect password");

            // Create the token
            const token = await UserService.generateToken(userExist as UserPayload);
            if (!token) return errorResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, "Oops, an error occurred while trying to log in :(");

            // Set the cookie with the token containing the logged-in user's information
            res.cookie('auth', token, {
                httpOnly: true, // This cookie will only be accessible by the server
                sameSite: 'strict', // Limits cookie sending on third-party requests
                maxAge: 24 * 60 * 60 * 1000 // Cookie expires in 1 day
            });

            return successResponse(res, HttpStatusCodes.OK, "User successfully login", token);
        } catch (e) {
            console.error(e);
            return errorResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, "Error trying to log in");
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
            // Check if the user wants to update the nick, and if it's already assigned to another user.
            if (info.nick) {
                const checkNewNick = await UserService.findUserByNick(info.nick);

                if (checkNewNick != false) {
                    return errorResponse(res, HttpStatusCodes.OK, "This nick is already used");
                }
            }

            if (info.password) {
                const newPassword = await UserService.hashPassword(info.password);
                if (!newPassword) return errorResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, "Error performing the operation");
                info.password = newPassword;
            }

            const update = await UserService.updateUser(user?.id, info);
            if (!update) {
                return errorResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, "Error updating the user's information");
            }

            return successResponse(res, HttpStatusCodes.OK, "User updated");

        } catch (e) {
            console.error(e);
            return errorResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, "Error updating the user, INTERNAL SERVER ERROR");
        }
    }

    static async upload(req: Request, res: Response): Promise<object | void> {
        const user = req.user;
        if (!user) return errorResponse(res, HttpStatusCodes.BAD_REQUEST, "User identity error");
        if (!req.file) {
            return errorResponse(res, HttpStatusCodes.BAD_REQUEST, "You need to upload an image");
        }
        // Get the file extension of the image uploaded by the client
        let image = req.file.originalname;
        let imageSplit = image.split("\.");
        let imageExtension = imageSplit[1];

        if (imageExtension !== "jpeg" && imageExtension !== "jpg" && imageExtension !== "png" && imageExtension !== "gif") {
            // Delete the image
            let imagePath = req.file.path;
            fs.unlinkSync(imagePath);

            return errorResponse(res, HttpStatusCodes.BAD_REQUEST, "Invalid image format");
        }

        let userImageUpdate = await UserService.updateUserImage(user.id, req.file.filename); // Update the image in the DB

        if (!userImageUpdate) {
            return errorResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, "Error updating the profile image");
        }

        return successResponse(res, HttpStatusCodes.OK, "Image", userImageUpdate);
    }

    static async usersList(req: Request, res: Response): Promise<object> {
        // Default page to show
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
            const users = await UserService.usersList(options); // List users
            return successResponse(res, HttpStatusCodes.OK, "App users list:", users);
        } catch (e) {
            console.error(e);
            return errorResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, "Error getting app users, INTERNAL SERVER ERROR");
        }
    }

    static async follows(req: Request, res: Response) {
        const { id } = req.params;
        if (!id) return errorResponse(res, HttpStatusCodes.BAD_REQUEST, "You must provide the user id to know who they follow!");

        let page: number = 1;
        let limit = 2;
        if (req.params.page) {
            page = parseInt(req.params.page);
        }

        try {

            const options = {
                query: { user: id },
                page,
                limit,
                select: "followed -_id",
                populate: {
                    path: "followed",
                    select: "nick name _id image"
                }
            }

            let followsArr: object[] = [];
            let follows = await FollowService.getUserFollows(options);
            if (!follows) return errorResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, "Error getting user's follows");

            follows.docs.map(follow => {
                followsArr.push(follow.followed);
            })

            return successResponse(res, HttpStatusCodes.OK, "Follows:", followsArr);
        } catch (e) {
            console.error(e);
            return errorResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, "Error getting user's follows!, INTERNAL SERVER ERROR");
        }
    }

    static async followers(req: Request, res: Response) {
        const { id } = req.params;
        if (!id) return errorResponse(res, HttpStatusCodes.BAD_REQUEST, "You must provide the user id to know who follows them!");

        let page: number = 1;
        let limit = 4;
        if (req.params.page) {
            page = parseInt(req.params.page);
        }

        try {
            const options = {
                query: { followed: id },
                page,
                limit,
                select: "user -_id",
                populate: {
                    path: "user",
                    select: "nick name _id image"
                }
            }

            const followers = await FollowService.getUserFollowers(options);
            if (!followers) return errorResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, "Error getting user's followers");

            return successResponse(res, HttpStatusCodes.OK, "Followers:", followers.docs);
        } catch (e) {
            console.error(e);
            return errorResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, "Error getting user's followers, INTERNAL SERVER ERROR");
        }

    }
}

export default UserController;
