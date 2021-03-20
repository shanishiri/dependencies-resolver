import app from "../app";
import axios from 'axios';
import MockAdapter from "axios-mock-adapter";
import npmResponseMock from "./npmResponseMock";
const request = require("supertest");

//TODO: test!!
describe('Test full flow', () => {
    let axiosMock;

    beforeEach(() => {
        axiosMock = new MockAdapter(axios);
    });

    afterEach(() => {
        axiosMock.reset();
    });

    test("It should response the GET method", async () => {
        const packageName = "express";
        const version = "latest";
        axiosMock.onAny(`https://registry.npmjs.org/*`).reply(200, npmResponseMock);

        const response = await request(app).get(`/package/${packageName}/${version}`);
        expect(response.statusCode).toBe(200);
    });

});


