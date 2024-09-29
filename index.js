import 'dotenv/config'
import express from 'express';
import {createServer} from "./js/server.js";
import { createRequestHandler } from "@remix-run/express";
import isProduction from './js/prod.js';
import * as vite from "vite";

const app = express();

let viteServer;
if (!isProduction) {
    viteServer = await vite.createServer({
        server: {middlewareMode: true}
    });
}

app.use(viteServer ? viteServer.middlewares : express.static('build/client'));

const build = viteServer ? () => viteServer.ssrLoadModule(
    "virtual:remix/server-build") : await import("./build/server/index.js");

app.all("*", createRequestHandler({ build }));

createServer(app);