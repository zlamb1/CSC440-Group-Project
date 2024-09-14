import express from 'express';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

import env from './js/env.js';

const app = express();

app.use(express.static('dist'));

const usePage = (name) => {
    const __dirname = dirname(fileURLToPath(import.meta.url));
    return path.join(__dirname + `/dist/src/pages/${name}.html`);
}

app.get('/', (req, res) => {
    res.sendFile(usePage('index'));
});

// return script with current live-server port
app.get('/poll.js', (req, res) => {
    res.setHeader("Content-Type", "text/javascript");
    res.send(`
        const eventSource = new EventSource('http://localhost:${env.getLiveServerPort()}');
        eventSource.onmessage = async (event) => {
            eventSource.close();
            // refresh page on update
            location.reload();
        }
    `);
    res.end(); 
});

// no route found
app.get('*', (req, res) => {
    res.sendFile(usePage('404'));
});

app.listen(env.getWebServerPort(), () => {
    console.log(`Server listening on port ${env.getWebServerPort()}`);
});