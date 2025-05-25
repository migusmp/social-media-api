import request from 'supertest';
import mongoose from 'mongoose';
import connection from '../../src/db/connection';
import { createToken, randomString } from '../test_utils/utils';
import app from '../../src';
import { fakeUserPayload } from './user_routes_test';

describe('Posts routes API', () => {
    beforeAll(async () => {
        await connection(); // conectas a la BBDD antes de los tests
    });

    const token = createToken(fakeUserPayload);
    let postCreatedId = "";

    it("POST /api/post/create  |  Test to create post", async () => {
        const textPost = {
            text: "some text from test" + randomString(3),
        }
        const res = await request(app)
            .post('/api/post/create')
            .set('Cookie', [`auth=${token}`])
            .type('form')
            .send(textPost);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('status', 'success');

        postCreatedId = res.body.data._id;
    })

    it("PUT /api/post/update  |  Test to update post", async () => {
        const res = await request(app)
            .put(`/api/post/update/${postCreatedId}`)
            .set('Cookie', [`auth=${token}`])
            .type('form')
            .send({ text: "new text to update post" + randomString(4) });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('status', 'success');
    })

    it("DELETE /api/post/delete  |  Test to delete post", async () => {
        const res = await request(app)
            .delete(`/api/post/delete/${postCreatedId}`)
            .set('Cookie', [`auth=${token}`])

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('status', 'success');
    })

    afterAll(async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        await mongoose.disconnect();
    });

})
