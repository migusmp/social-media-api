import request from 'supertest';
import mongoose from 'mongoose';
import connection from '../../src/db/connection';
import { createToken, registerAndLoginAndReturnId } from '../test_utils/utils';
import app from '../../src';
import { fakeUserPayload } from './user_routes_test';

describe('Follows routes API', () => {
    beforeAll(async () => {
        await connection(); // conectas a la BBDD antes de los tests
    });

    const token = createToken(fakeUserPayload);
    let idUserToFollowAndUnFollow = "";

    it("POST /api/follows/follow/:userFollowdId  |  Test to follow an user", async () => {
        idUserToFollowAndUnFollow = await registerAndLoginAndReturnId();
        const res = await request(app)
            .post(`/api/follows/follow/${idUserToFollowAndUnFollow}`)
            .set('Cookie', [`auth=${token}`])
            .type('form')

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('status', 'success');
    })

    it("DELETE /api/follows/unfollow/:userUnfollowed  |  Test to unfollow an user", async () => {
        idUserToFollowAndUnFollow = await registerAndLoginAndReturnId();
        const res = await request(app)
            .delete(`/api/follows/unfollow/${idUserToFollowAndUnFollow}`)
            .set('Cookie', [`auth=${token}`])
            .type('form')

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('status', 'success');
    })

    afterAll(async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        await mongoose.disconnect();
    });

})

