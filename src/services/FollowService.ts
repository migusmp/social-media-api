import { PaginationOptions } from "mongoose-paginate-ts";
import { Follow } from "../model/follow";

class FollowService {
    public async follow(user: string, userFollowed: string): Promise<boolean> {
        try {
            const follow = {
                user: user,
                followed: userFollowed
            }

            const newFollow = new Follow(follow);
            newFollow.save();
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    public async checkUserFollow(user: string, userFollowed: string): Promise<boolean | object> {
        try {
            // Verificamos si el follow existe
            const followVerify = await Follow.findOne({ user: user, followed: userFollowed });
            if (followVerify) {
                return followVerify;
            }
            // Verificamos que el usuario no se intenta seguir así mismo
            if (user === userFollowed) {
                return false;
            }
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    public async unfollow(user: string, userFollowed: string) {
        try {
            const deleteFollow = await Follow.findOneAndDelete({ user: user, followed: userFollowed }, { new: true });
            if (!deleteFollow) return false;
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    public async getUserFollows(options: PaginationOptions) {
        try {
            const userFollows = await Follow.paginate(options);
            return userFollows;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    public async getUserFollowers(options: PaginationOptions) {
        try {
            const followers = await Follow.paginate(options);
            return followers;
        } catch (e) {
            console.error(e);
            return false;
        }
    }
}

export default new FollowService;
