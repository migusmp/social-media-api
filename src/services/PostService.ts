import { CreatePublication } from "../controller/post";
import { Post } from "../model/publication";

class PostService {
    public async createPost(publicacion: CreatePublication) {
        try {
            const publication = new Post(publicacion);
            await publication.save();
            return publication;
        } catch(e) {
            console.error(e);
            return false;
        }
    }
    // Función para verificar 
    public async verifyPostUser(userId: string, publicationId: string) {
        try {
            const checkPublication = await Post.findOne({ user: userId, _id: publicationId });
            if (checkPublication) {
                return true;
            }
            return false;
        } catch(e) {
            console.error(e);
            return false;
        }
    }

    // Función para eliminar una publicación
    public async deletePost(publicationId: string) {
        try {
            const deletePost = await Post.findByIdAndDelete(publicationId);
            if (!deletePost) {
                return false;
            }
            return true;
        } catch(e) {
            console.error(e);
            return false;
        }
    }

    public async updatePost(postId: string, text: string) {
        try {
            const updatePost = await Post.findByIdAndUpdate(postId, { text }, { new: true });
            if (!updatePost) {
                return false;
            }
            return updatePost;
        } catch(e) {
            console.error(e);
            return false;
        }
    }
}

export default new PostService;