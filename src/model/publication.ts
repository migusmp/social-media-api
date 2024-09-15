import mongoose, { model, Schema } from "mongoose";
import { mongoosePagination, Pagination } from "mongoose-paginate-ts";

export type Post = mongoose.Document & {
    user:  string;
    text: string;
    image: string;
    likes: [ mongoose.Types.ObjectId ];
    comments: [ mongoose.Types.ObjectId ];
    created_at: Date
}

const PostSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: true,
        default: ' '
    },
    image: {
        type: String,
        default: ''
    },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    created_at: {
        type: Date,
        default: Date.now()
    }
})

PostSchema.plugin(mongoosePagination);
export const Publication: Pagination<Post> = model<Post, Pagination<Post>>('Publication', PostSchema);