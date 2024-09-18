import express from 'express';
import multer from "multer";
import path, { dirname, extname } from 'path';
import { fileURLToPath } from 'url';

import './js/db/user.js';
import './js/db/story.js';
import './js/db/comment.js';
import './js/db/friend.js';
import './js/db/message_queue.js';
import './js/db/session.js'

import env from './js/server_env.js';
import ImageStorage from "./js/image_storage.js";
import fs from "fs";

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

const routes = [];
function resolveRoutes(path, initialPath) {
    initialPath = initialPath ?? path;
    fs.readdirSync(path, {withFileTypes: true}).forEach(function(file) {
        const ext = extname(file.name);
        if (file.isDirectory()) {
            return resolveRoutes(file.path + '/' + file.name, initialPath);
        } else if (ext === '.js') {
            routes.push({
                path: file.path + '/' + file.name,
                route: file.path.replace(initialPath, '') + '/' + file.name.substring(0, file.name.lastIndexOf('.'))
            });
        }
    });
}

// dynamically resolve routes
resolveRoutes('./routes');
const nodeEnv = process.env.NODE_ENV || 'development';

for (const route of routes) {
    const routeImport = await import(route.path);
    if (nodeEnv === 'development' || !routeImport?.DEV_ROUTE) {
        if (route.route === '/index') route.route = '/';
        ['get', 'post', 'put', 'delete'].forEach(method => {
            if (method === 'get' && !routeImport['get'] && routeImport.default) {
                app.get(route.route, (req, res, next) => {
                    routeImport.default(req, res, next, usePage);
                })
            }
            if (routeImport[method]) {
                app[method](route.route, (req, res, next) => {
                    routeImport[method](req, res, next, usePage);
                });
            }
        });
    }
}

app.get('*', (req, res) => {
    res.sendFile(usePage('404'));
});

app.listen(env.getWebServerPort(), () => {
    console.log(`Server listening on port ${env.getWebServerPort()}`);
});