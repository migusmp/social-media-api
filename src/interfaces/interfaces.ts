import { Request } from "express";

export interface ExpressRequest extends Request {
    user: PayloadComplete
}

export interface PayloadComplete {
    id: string;
    name: string;
    nick: string;
    email: string;
    description: string;
    password: string;
    image: string;
    created_at: Date;
    iat: number,
    exp: number
}

export interface UpdateData {
    name?: string;
    nick?: string;
    password?: string;
    description?: string;
}