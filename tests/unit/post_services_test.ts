import { Post } from "../../src/model/publication";
import PostService from "../../src/services/PostService";

jest.mock("../../src/model/publication", () => {
    return {
        Post: jest.fn().mockImplementation(() => ({
            save: jest.fn(),
        })),
    };
});

describe("PostService", () => {
    const postData = {
        user: "user123",
        text: "Test post",
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("verifyPostUser", () => {
        beforeAll(() => {
            (Post.findOne as jest.Mock) = jest.fn();
        });

        it("should return true if the post belongs to the user", async () => {
            (Post.findOne as jest.Mock).mockResolvedValue(postData);

            const result = await PostService.verifyPostUser("user123", "postId123");

            expect(Post.findOne).toHaveBeenCalledWith({ user: "user123", _id: "postId123" });
            expect(result).toBe(true);
        });

        it("should return false if no matching post is found", async () => {
            (Post.findOne as jest.Mock).mockResolvedValue(null);

            const result = await PostService.verifyPostUser("user123", "postId123");

            expect(result).toBe(false);
        });

        it("should return false if an error occurs", async () => {
            (Post.findOne as jest.Mock).mockRejectedValue(new Error("fail"));

            const result = await PostService.verifyPostUser("user123", "postId123");

            expect(result).toBe(false);
        });
    });

    describe("deletePost", () => {
        beforeAll(() => {
            (Post.findByIdAndDelete as jest.Mock) = jest.fn();
        });

        it("should return true if the post is successfully deleted", async () => {
            (Post.findByIdAndDelete as jest.Mock).mockResolvedValue(postData);

            const result = await PostService.deletePost("postId123");

            expect(Post.findByIdAndDelete).toHaveBeenCalledWith("postId123");
            expect(result).toBe(true);
        });

        it("should return false if the post to delete was not found", async () => {
            (Post.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

            const result = await PostService.deletePost("postId123");

            expect(result).toBe(false);
        });

        it("should return false if an error occurs", async () => {
            (Post.findByIdAndDelete as jest.Mock).mockRejectedValue(new Error("fail"));

            const result = await PostService.deletePost("postId123");

            expect(result).toBe(false);
        });
    });

    describe("updatePost", () => {
        beforeAll(() => {
            (Post.findByIdAndUpdate as jest.Mock) = jest.fn();
        });

        it("should return the updated post if successful", async () => {
            const updatedPost = { ...postData, text: "new text" };
            (Post.findByIdAndUpdate as jest.Mock).mockResolvedValue(updatedPost);

            const result = await PostService.updatePost("postId123", "new text");

            expect(Post.findByIdAndUpdate).toHaveBeenCalledWith(
                "postId123",
                { text: "new text" },
                { new: true }
            );
            expect(result).toEqual(updatedPost);
        });

        it("should return false if the post to update was not found", async () => {
            (Post.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

            const result = await PostService.updatePost("postId123", "new text");

            expect(result).toBe(false);
        });

        it("should return false if an error occurs", async () => {
            (Post.findByIdAndUpdate as jest.Mock).mockRejectedValue(new Error("fail"));

            const result = await PostService.updatePost("postId123", "new text");

            expect(result).toBe(false);
        });
    });
});

