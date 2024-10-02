import 'dotenv/config'
import express from 'express';
import {createServer} from "./js/server.js";
import {createRequestHandler} from "@remix-run/express";
import isProduction from './js/prod.js';
import * as vite from "vite";
import {createUser, isUsernameAvailable, validateUser} from "./js/db/users.js";
import {commitSession, destroySession, getSession, useUserData} from "./js/auth.js";

const app = express();

// derive IP from X-Forwarded header
// allows obtaining source IP behind reverse proxy
app.enable('trust proxy');

let viteServer;
if (!isProduction) {
    viteServer = await vite.createServer({
        server: {middlewareMode: true}
    });
}

app.use(viteServer ? viteServer.middlewares : express.static('build/client'));

const build = viteServer ? () => viteServer.ssrLoadModule(
    "virtual:remix/server-build") : await import("./build/server/index.js");

app.all("*", createRequestHandler({ build, async getLoadContext(req, res) {
        const { data, session } = await useUserData(req);
        if (data.loggedIn) {
            // update session expiration on request
            res.setHeader('Set-Cookie', await commitSession(session));
        }
        return {
            user: {
                data, isUsernameAvailable, createUser, validateUser
            },
            session: {
                getSession, commitSession, destroySession
            }
        }
    }
}));

createServer(app);