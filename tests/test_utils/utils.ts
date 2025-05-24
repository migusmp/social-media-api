import moment from "moment";
import { UserPayload } from "../../src/utils/types";
import jwt from 'jwt-simple'

const secret = process.env.SECRET_PAYLOAD_KEY;

export function randomString(length: number): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export function createToken(user: UserPayload): string {
    const payload = {
        id: user._id,
        name: user.name,
        nick: user.nick,
        email: user.email,
        description: user.description,
        password: user.password,
        image: user.image,
        created_at: user.created_at,
        iat: moment().unix(),
        exp: moment().add(30, "days").unix()
    };
    return jwt.encode(payload, secret!, 'HS256');
}

