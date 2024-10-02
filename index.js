import 'dotenv/config'
import express from 'express';
import {createServer} from "./js/server.js";
import {createRequestHandler} from "@remix-run/express";
import isProduction from './js/prod.js';
import * as vite from "vite";
import {createUser, getUser, isUsernameAvailable, validateUser} from "./js/db/users.js";

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

import {createCookie, createCookieSessionStorage, createSessionStorage} from "@remix-run/node";
import {createData, deleteData, readData, updateData} from "./js/db/sessions.js";

const cookie = createCookie('__session', {
    httpOnly: true,
    // lasts three days
    maxAge: 60 * 60 * 24 * 3,
    path: "/",
    sameSite: "lax",
    secrets: ["s3cret1"],
    secure: true,
});

const { getSession, commitSession, destroySession } = createSessionStorage({
    cookie,
    createData,
    readData,
    updateData,
    deleteData
})

app.all("*", createRequestHandler({ build, getLoadContext(req, res) {
        return {
            user: {
                isUsernameAvailable, createUser, validateUser, getUser
            },
            session: {
                getSession, commitSession, destroySession
            }
        }
    }
}));

createServer(app);