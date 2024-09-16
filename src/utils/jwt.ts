import jwt from 'jwt-simple';
import moment from 'moment';
import { UserPayload } from './types';
import { PayloadComplete } from '../interfaces/interfaces';


const secret = process.env.SECRET_PAYLOAD_KEY;

export const createToken = async (info: UserPayload) => {
    if (!secret) return;
    const payload: PayloadComplete = {
        id: info._id.toString(),
        name: info.name.toString(),
        nick: info.nick.toString(),
        email: info.email.toString(),
        description: info.description.toString(),
        password: info.password.toString(),
        image: info.image.toString(),
        created_at: info.created_at,
        iat: moment().unix(),
        exp: moment().add(30, "days").unix()
    }

    return jwt.encode(payload, secret, 'HS256')
}