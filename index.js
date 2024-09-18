import express from 'express';
import multer from "multer";
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

import './js/db/user.js';
import './js/db/story.js';
import './js/db/comment.js';
import './js/db/friend.js';
import './js/db/message_queue.js';
import './js/db/session.js'

import env from './js/server_env.js';
import {UnsupportedFileFormat} from "./js/image_storage.js";
import ImageStorage from "./js/image_storage.js";
import {generateUserSession} from "./js/db/session.js";

const app = express();

const upload = multer({
    storage: new ImageStorage({
        destination: './uploads'
    }),
    limits: {
        // 512KB upload limit
        fileSize: 1024 * 512
    },
});

app.post('/test', (req, res) => {
    upload.single('profileImage')(req, res, err => {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            res.writeHead(500);
            return res.end();
        } else if (err instanceof UnsupportedFileFormat) {
            res.writeHead(415);
            return res.end(err.msg);
        }
        // Everything went fine.
        res.writeHead(201);
        res.end();
    });
});

app.use(express.static('dist'));

const usePage = (name) => {
    const __dirname = dirname(fileURLToPath(import.meta.url));
    return path.join(__dirname + `/dist/src/pages/${name}.html`);
}

app.get('/', (req, res) => {
    res.sendFile(usePage('index'));
});

const nodeEnv = process.env.NODE_ENV || 'development';
if (nodeEnv === 'development') {
    // return script with current live-server port
    app.get('/poll.js', (req, res) => {
        res.setHeader("Content-Type", "text/javascript");
        res.end(`
            const eventSource = new EventSource('http://localhost:${env.getLiveServerPort()}');
            eventSource.onmessage = async (event) => {
                eventSource.close();
                // refresh page on update
                location.reload();
            }
        `);
    });
}

// no route found
app.get('*', (req, res) => {
    res.sendFile(usePage('404'));
});

app.listen(env.getWebServerPort(), () => {
    console.log(`Server listening on port ${env.getWebServerPort()}`);
});

generateUserSession(123123).catch((err) => {
    console.log(err);
});