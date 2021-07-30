import { RequestHandler } from "express";
import config from 'src/config';
import basicAuth from 'express-basic-auth';

export const basicAuthMiddleware = (): RequestHandler => {
    return basicAuth({
        challenge: true,
        users: {
            [<string>config.server.basicAuth.username]: <string>config.server.basicAuth.password
        }
    });
}