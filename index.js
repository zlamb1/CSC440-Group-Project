import express from 'express';
import multer from 'multer';
import http from 'http';
import https from 'https';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

import './js/db/imports.js';

import env from './js/server_env.js';
import ImageStorage from "./js/image_storage.js";
import fs from "fs";
import {mapRoutes, resolveRoutes} from "./js/routes.js";

const isProduction = process.env.NODE_ENV === 'production';

const app = express();
const imageUpload = multer({
    storage: new ImageStorage({
        destination: './uploads'
    }),
    limits: {
        // 512KB upload limit
        fileSize: 1024 * 512
    },
});

app.use(express.static('dist'));

const __dirname = dirname(fileURLToPath(import.meta.url));
const usePage = (name) => {
    return path.join(__dirname + `/dist/src/pages/${name}.html`);
}

// dynamically resolve routes
const routes = resolveRoutes(path.join(__dirname, '/routes'));
await mapRoutes(app, routes, usePage);

app.get('*', (req, res) => {
    res.sendFile(usePage('404'));
});

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