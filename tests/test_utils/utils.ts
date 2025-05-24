import moment from "moment";
import request from 'supertest';
import { UserPayload } from "../../src/utils/types";
import jwt from 'jwt-simple'
import app from "../../src";

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

const randomUser = {
    name: 'name' + randomString(7),
    nick: 'nick' + randomString(7),
    email: randomString(7) + '@example.com',
    password: 1234,
};

export async function registerAndLoginAndReturnId() {
    await request(app)
        .post('/api/user/register')
        .type('form')
        .send(randomUser);

    const userLogin = {
        nick: randomUser.nick,
        password: randomUser.password,
    }
    const res = await request(app)
        .post('/api/user/login')
        .type('form')
        .send(userLogin);

    const token = res.body.data;

    const secret = process.env.SECRET_PAYLOAD_KEY!;
    const decodedPayload = jwt.decode(token, secret, false, 'HS256');

    return decodedPayload.id || decodedPayload._id
}

