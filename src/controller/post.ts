import { Request as ExpressRequest, Response } from "express";
import { errorResponse, successResponse } from "../utils/responses";
import { HttpStatusCodes } from "../utils/httpStatusCodes";
import { PayloadComplete } from "../interfaces/interfaces";
import PostService from "../services/PostService";

interface Request extends ExpressRequest  {
    user?: PayloadComplete
}

export type CreatePublication = {
    user: string,
    text: string,
    image?: string,
}
class PostController {
    static async create(req: Request, res: Response) {
        const userIdentity = req.user; // Comprobamos quien quiere hacer una publicación
        const { text } = req.body;
        if (!text || !userIdentity) { // Verificamos que el usuario introduzca el texto de la publicación
            return errorResponse(res, HttpStatusCodes.BAD_REQUEST, "Text are required");
        }
        try {
        const publication: CreatePublication = {
            user: userIdentity?.id,
            text: text,
        }
        // Creamos la publicación
        const newPublication = await PostService.createPost(publication);
        if (newPublication === false) {
            return errorResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, "Error al crear la publicacion");
        }

        return successResponse(res, HttpStatusCodes.OK, "Publicación creada correctamente: ", newPublication);
        } catch(e) {
            console.error(e);
            return errorResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, "Error al crear la publicación, INTERNAL SERVER ERROR, :(")
        }
    }

    static async delete(req: Request, res: Response) {
        const userIdentity = req.user;
        const { postId } = req.body;
        if (!userIdentity || !postId) {
            return errorResponse(res, HttpStatusCodes.BAD_REQUEST, "Debes de introducir el id de la publicación para poder eliminar la publicación");
        }
        try {
            // Verificar que el usuario que el usuario que quiere eliminar la publicación es el que la ha subido
            const verifyUser = await PostService.verifyPostUser(userIdentity.id, postId);
            if (verifyUser != true) {
                return errorResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, "Publicación no encontrada");
            }

            // Función para eliminar la publicación
            const deletePost = await PostService.deletePost(postId);
            if (deletePost != true) {
                return errorResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, "Error al eliminar la publicación");
            }

            return successResponse(res, HttpStatusCodes.OK, "Publicación eliminada correctamente");
        } catch(e) {
            console.error(e);
            return errorResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, "Error al eliminar la publicación, INTERNAL SERVER ERROR :(");
        }
    }

    static async update(req: Request, res: Response) {
        const userIdentity = req.user;
        const { postId, text } = req.body;
        if (!postId || !userIdentity) {
            return errorResponse(res, HttpStatusCodes.BAD_REQUEST, "Debes de introducir el identificador de la publicación");
        }
        try {
            // Verificar que el usuario que el usuario que quiere eliminar la publicación es el que la ha subido
            const verifyUser = await PostService.verifyPostUser(userIdentity.id, postId);
            if (verifyUser != true) {
                return errorResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, "El post no existe");
            }

            // Actualizamos la publicación
            const updatePost = await PostService.updatePost(postId, text);
            if (updatePost == false) return errorResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, "Error al actualizar la publicación");

            return successResponse(res, HttpStatusCodes.OK, "Publicación actualizada correctamente: ", updatePost);
        } catch(e) {
            console.error(e);
            return errorResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, "Error al actualizar la información de la publicación");
        }
    }
}

export default PostController;