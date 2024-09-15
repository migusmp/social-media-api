import mongoose, { Schema, model } from "mongoose";
import { mongoosePagination, Pagination } from "mongoose-paginate-ts";

export type Comment = mongoose.Document & {
    user: string,
    post: string,
    text: string,
    image?: string,
    likes: [ mongoose.Types.ObjectId ],
    created_at: Date
}

const CommentSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    text: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: ''
    },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    created_at: {
        type: Date,
        default: Date.now()
    }
})

CommentSchema.plugin(mongoosePagination);

export const Comment: Pagination<Comment> = model<Comment, Pagination<Comment>>("Comment",  CommentSchema);
