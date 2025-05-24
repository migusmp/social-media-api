import { Request as ExpressRequest, Response } from "express";
import { errorResponse, successResponse } from "../utils/responses";
import { HttpStatusCodes } from "../utils/httpStatusCodes";
import { PayloadComplete } from "../interfaces/interfaces";
import PostService from "../services/PostService";

interface Request extends ExpressRequest {
    user?: PayloadComplete
}

export type CreatePublication = {
    user: string,
    text: string,
    image?: string,
}

class PostController {
    static async create(req: Request, res: Response) {
        const userIdentity = req.user; // Check who is trying to create a post
        const { text } = req.body;
        if (!text || !userIdentity) { // Make sure the user provides the post text
            return errorResponse(res, HttpStatusCodes.BAD_REQUEST, "Text is required");
        }
        try {
            const publication: CreatePublication = {
                user: userIdentity?.id,
                text: text,
            }
            // Create the post
            const newPublication = await PostService.createPost(publication);
            if (newPublication === false) {
                return errorResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, "Error creating the post");
            }

            return successResponse(res, HttpStatusCodes.OK, "Post created successfully:", newPublication);
        } catch (e) {
            console.error(e);
            return errorResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, "Error creating the post, INTERNAL SERVER ERROR :(");
        }
    }

    static async delete(req: Request, res: Response) {
        const userIdentity = req.user;
        const { postId } = req.body;
        if (!userIdentity || !postId) {
            return errorResponse(res, HttpStatusCodes.BAD_REQUEST, "You must provide the post ID to delete it");
        }
        try {
            // Verify that the user trying to delete the post is the one who created it
            const verifyUser = await PostService.verifyPostUser(userIdentity.id, postId);
            if (verifyUser !== true) {
                return errorResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, "Post not found");
            }

            // Delete the post
            const deletePost = await PostService.deletePost(postId);
            if (deletePost !== true) {
                return errorResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, "Error deleting the post");
            }

            return successResponse(res, HttpStatusCodes.OK, "Post deleted successfully");
        } catch (e) {
            console.error(e);
            return errorResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, "Error deleting the post, INTERNAL SERVER ERROR :(");
        }
    }

    static async update(req: Request, res: Response) {
        const userIdentity = req.user;
        const { postId, text } = req.body;
        if (!postId || !userIdentity) {
            return errorResponse(res, HttpStatusCodes.BAD_REQUEST, "You must provide the post ID");
        }
        try {
            // Verify that the user trying to update the post is the one who created it
            const verifyUser = await PostService.verifyPostUser(userIdentity.id, postId);
            if (verifyUser !== true) {
                return errorResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, "The post does not exist");
            }

            // Update the post
            const updatePost = await PostService.updatePost(postId, text);
            if (updatePost === false) {
                return errorResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, "Error updating the post");
            }

            return successResponse(res, HttpStatusCodes.OK, "Post updated successfully:", updatePost);
        } catch (e) {
            console.error(e);
            return errorResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, "Error updating post information");
        }
    }
}

export default PostController;

