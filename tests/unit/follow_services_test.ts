// followService.test.ts
import { Follow } from "../../src/model/follow";
import FollowService from "../../src/services/FollowService";

jest.mock("../../src/model/follow");

describe("FollowService", () => {
    const mockUser = "user1";
    const mockUserFollowed = "user2";

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("follow", () => {
        it("should create and save a new follow and return true", async () => {
            const saveMock = jest.fn().mockResolvedValue(undefined);
            (Follow as any).mockImplementation(() => ({ save: saveMock }));

            const result = await FollowService.follow(mockUser, mockUserFollowed);

            expect(Follow).toHaveBeenCalledWith({ user: mockUser, followed: mockUserFollowed });
            expect(saveMock).toHaveBeenCalled();
            expect(result).toBe(true);
        });

        it("should return false on save error", async () => {
            const saveMock = jest.fn().mockRejectedValue(new Error("fail"));
            (Follow as any).mockImplementation(() => ({ save: saveMock }));

            const result = await FollowService.follow(mockUser, mockUserFollowed);

            expect(result).toBe(false);
        });
    });

    describe("checkUserFollow", () => {
        it("should return follow object if found", async () => {
            const followObj = { user: mockUser, followed: mockUserFollowed };
            (Follow.findOne as jest.Mock).mockResolvedValue(followObj);

            const result = await FollowService.checkUserFollow(mockUser, mockUserFollowed);

            expect(Follow.findOne).toHaveBeenCalledWith({ user: mockUser, followed: mockUserFollowed });
            expect(result).toBe(followObj);
        });

        it("should return false if user tries to follow themselves", async () => {
            (Follow.findOne as jest.Mock).mockResolvedValue(null);

            const result = await FollowService.checkUserFollow(mockUser, mockUser);

            expect(result).toBe(false);
        });

        it("should return true if no follow found and not following self", async () => {
            (Follow.findOne as jest.Mock).mockResolvedValue(null);

            const result = await FollowService.checkUserFollow(mockUser, mockUserFollowed);

            expect(result).toBe(true);
        });

        it("should return false on error", async () => {
            (Follow.findOne as jest.Mock).mockRejectedValue(new Error("fail"));

            const result = await FollowService.checkUserFollow(mockUser, mockUserFollowed);

            expect(result).toBe(false);
        });
    });

    describe("unfollow", () => {
        it("should return true if follow deleted", async () => {
            (Follow.findOneAndDelete as jest.Mock).mockResolvedValue({});

            const result = await FollowService.unfollow(mockUser, mockUserFollowed);

            expect(Follow.findOneAndDelete).toHaveBeenCalledWith({ user: mockUser, followed: mockUserFollowed }, { new: true });
            expect(result).toBe(true);
        });

        it("should return false if no follow deleted", async () => {
            (Follow.findOneAndDelete as jest.Mock).mockResolvedValue(null);

            const result = await FollowService.unfollow(mockUser, mockUserFollowed);

            expect(result).toBe(false);
        });

        it("should return false on error", async () => {
            (Follow.findOneAndDelete as jest.Mock).mockRejectedValue(new Error("fail"));

            const result = await FollowService.unfollow(mockUser, mockUserFollowed);

            expect(result).toBe(false);
        });
    });

    describe("getUserFollows", () => {
        const mockOptions = { page: 1, limit: 10 };

        it("should return paginated user follows", async () => {
            const paginatedResult = { docs: [], totalDocs: 0 };
            (Follow.paginate as jest.Mock).mockResolvedValue(paginatedResult);

            const result = await FollowService.getUserFollows(mockOptions);

            expect(Follow.paginate).toHaveBeenCalledWith(mockOptions);
            expect(result).toBe(paginatedResult);
        });

        it("should return false on error", async () => {
            (Follow.paginate as jest.Mock).mockRejectedValue(new Error("fail"));

            const result = await FollowService.getUserFollows(mockOptions);

            expect(result).toBe(false);
        });
    });

    describe("getUserFollowers", () => {
        const mockOptions = { page: 1, limit: 10 };

        it("should return paginated followers", async () => {
            const paginatedResult = { docs: [], totalDocs: 0 };
            (Follow.paginate as jest.Mock).mockResolvedValue(paginatedResult);

            const result = await FollowService.getUserFollowers(mockOptions);

            expect(Follow.paginate).toHaveBeenCalledWith(mockOptions);
            expect(result).toBe(paginatedResult);
        });

        it("should return false on error", async () => {
            (Follow.paginate as jest.Mock).mockRejectedValue(new Error("fail"));

            const result = await FollowService.getUserFollowers(mockOptions);

            expect(result).toBe(false);
        });
    });
});

