import { Request } from "express";

export interface ExpressRequest extends Request {
    user: PayloadComplete
}


export interface PayloadComplete {
    id: string;
    name: string;
    nick: string;
    email: string;
    password: string;
    followers: string[];
    following: string[];
    image: string;
    created_at: Date;
    iat: number,
    exp: number
}