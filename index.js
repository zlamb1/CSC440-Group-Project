import express from 'express';
import http from 'http';
import https from 'https';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

import './js/db/imports.js';

import env from './js/server_env.js';
import fs from "fs";
import {mapRoutes, resolveRoutes} from "./js/routes.js";
import useHTMLPage, {setDirname} from "./js/page.js";

const isProduction = process.env.NODE_ENV === 'production';

const app = express();

/* const imageUpload = multer({
    storage: new ImageStorage({
        destination: './uploads'
    }),
    limits: {
        // 512KB upload limit
        fileSize: 1024 * 512
    },
}); */

app.use(express.static('dist'));

const __dirname = dirname(fileURLToPath(import.meta.url));
setDirname(__dirname);

// dynamically resolve routes
const routes = resolveRoutes(path.join(__dirname, '/routes'));
await mapRoutes(app, routes, __dirname);

app.get('*', useHTMLPage('404'));

if (isProduction) {
    const key = fs.readFileSync(process.env.KEY_PATH || '.key', 'utf-8');
    const cert = fs.readFileSync(process.env.CERT_PATH || '.pem', 'utf-8');
    const credentials = { key, cert };
    const ports = env.getWebServerPorts();
    const httpServer = http.createServer(app);
    httpServer.listen(ports.http);
    const httpsServer = https.createServer(credentials, app);
    httpsServer.listen(ports.https);
} else {
    app.listen(env.getWebServerPorts().http, () => {
        console.log(`Server listening on port ${env.getWebServerPorts().http}`);
    });
}