import request from 'supertest';
import app from '../../src/index';
import mongoose, { Types } from 'mongoose';
import connection from '../../src/db/connection'; // o donde tengas el connection
import jwt from 'jwt-simple'
import moment from 'moment';
import { UserPayload } from '../../src/utils/types';
const secret = process.env.SECRET_PAYLOAD_KEY;

function randomString(length: number): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function createToken(user: UserPayload): string {
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

describe('User routes API', () => {
    beforeAll(async () => {
        await connection(); // conectas a la BBDD antes de los tests
    });

    const randomUser = {
        name: 'name' + randomString(5),
        nick: 'nick' + randomString(5),
        email: randomString(5) + '@example.com',
        password: 1234,
    };

    let fakeUserPayload = {
        _id: new Types.ObjectId().toString(),
        name: randomUser.name,
        nick: randomUser.nick,
        email: randomUser.email,
        password: "1234",
        description: "User for testing",
        followers: [new Types.ObjectId(), new Types.ObjectId()],
        following: [new Types.ObjectId()],
        image: "default.png",
        created_at: new Date(),
    };

    // TEST REGISTER USERS ROUTE
    it('POST /api/user/register You must register a user with urlencoded data', async () => {
        const res = await request(app)
            .post('/api/user/register')
            .type('form')
            .send(randomUser);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('status', 'success');
        expect(res.body).toHaveProperty('message', 'Successfully registered user');
    });

    // TEST LOGIN USERS ROUTE
    it('POST /api/user/login Test a login route', async () => {
        const userLogin = {
            nick: randomUser.nick,
            password: randomUser.password,
        }
        const res = await request(app)
            .post('/api/user/login')
            .type('form')
            .send(userLogin);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('status', 'success');
        expect(res.body).toHaveProperty('message', 'User successfully logged in!');
        expect(res.body).toHaveProperty('data');

        const token = res.body.data;

        const secret = process.env.SECRET_PAYLOAD_KEY!;
        const decodedPayload = jwt.decode(token, secret, false, 'HS256');

        fakeUserPayload._id = decodedPayload.id || decodedPayload._id;
    });

    // TEST UPDATE USERS DATA ROUTE
    it('PUT /api/user/update Test a update users data route', async () => {
        const token = createToken(fakeUserPayload);
        const dataToUpdate = {
            nick: randomUser.nick + "_update",
        }
        const res = await request(app)
            .put('/api/user/update')
            .set('Cookie', [`auth=${token}`])
            .type('form')
            .send(dataToUpdate);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('status', 'success');
        expect(res.body).toHaveProperty('message', 'User updated!');
    });

    // TEST USERS LIST ROUTE
    it('GET /api/user/list/:page? Test a update users data route', async () => {
        const res = await request(app)
            .get('/api/user/list/1')

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('status', 'success');
    });

    // TEST USER FOLLOWS LIST ROUTE
    it('GET /api/user/follows/:id/:page? Test a update users data route', async () => {
        const token = createToken(fakeUserPayload);
        const res = await request(app)
            .get(`/api/user/follows/${fakeUserPayload._id}`)
            .set('Cookie', [`auth=${token}`])


        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('status', 'success');
    });

    // TEST USER FOLLOWERS LIST ROUTE
    it('GET /api/user/followers/:id/:page? Test a update users data route', async () => {
        const token = createToken(fakeUserPayload);
        const res = await request(app)
            .get(`/api/user/followers/${fakeUserPayload._id}`)
            .set('Cookie', [`auth=${token}`])


        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('status', 'success');
    });

    // TEST USER UPLOADS ROUTE
    it('GET /api/user/upload  |  Test - should upload an image successfully ', async () => {
        const token = createToken(fakeUserPayload);
        const res = await request(app)
            .post(`/api/user/upload`)
            .set('Cookie', [`auth=${token}`])
            .attach('file0', 'tests/assets/test-image.jpg')


        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('status', 'success');
    });

    afterAll(async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        await mongoose.disconnect();
    });
});

