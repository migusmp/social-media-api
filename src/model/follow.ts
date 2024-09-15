import mongoose, { Date, ObjectId, Schema, model } from "mongoose";
import { mongoosePagination, Pagination } from "mongoose-paginate-ts";

type Follow = mongoose.Document & {
    user: ObjectId,
    followed: ObjectId,
    cretaed_at: Date
}

const FollowSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    followed: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now()
    }
})

FollowSchema.plugin(mongoosePagination);

export const Follow: Pagination<Follow> = model<Follow, Pagination<Follow>>("Follow", FollowSchema); 