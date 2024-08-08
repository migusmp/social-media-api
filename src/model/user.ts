import mongoose, { Schema, Types, model } from "mongoose";
import { mongoosePagination, Pagination } from "mongoose-paginate-ts";

type User = mongoose.Document & {
    name: String,
    nick: String,
    email: String,
    description?: String,
    following: [ mongoose.Types.ObjectId ],
    followers: [ mongoose.Types.ObjectId ],
    image?: String,
    created_at: String
}

const UserSchema = new Schema({

    name: {
        type: String,
        required: true
    },
    nick: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    password: {
        type: String,
        required: true
    },
    following: [ { type: Types.ObjectId, ref: "User" }],
    followers: [ { type: Types.ObjectId, ref: "User" }],
    image: {
        type: String,
        default: "default.jpg"
    },
    created_at: {
        type: Date,
        default: Date.now()
    }

})

UserSchema.plugin(mongoosePagination);
export const User: Pagination<User> = model<UserActivation, Pagination<User>>("User", UserSchema)