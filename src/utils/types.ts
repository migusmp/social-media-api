import mongoose, { Types } from "mongoose"

export type User = mongoose.Document & {
    name: String,
    nick: String,
    email: String,
    description?: String,
    password: string,
    following: [ mongoose.Types.ObjectId ],
    followers: [ mongoose.Types.ObjectId ],
    image?: String,
    created_at: String
}

export type UserType = {
    name: string,
    nick: string,
    email: string,
    description?: string,
    password: string,
    following: string[],
    followers: string[],
    image?: string,
    created_at: string
}

export type UserPayload = {
    _id: String;
    name: String;
    nick: String;
    email: String;
    password: String;
    description: String;
    followers: Types.ObjectId[];
    following: Types.ObjectId[];
    image: String;
    created_at: Date;
}

export type ErrorsRegister = {
    name?: string,
    nick?: string,
    email?: string,
    password?: string
}

export type RegisterInfo = {
    name: string,
    nick: string,
    email: string,
    password: string
}