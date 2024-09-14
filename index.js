import express from 'express';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

import reload from './js/reload.js'; 

const app = express();
const port = process.env.PORT || 8080; 

app.use(express.static('dist'));

const usePage = (name) => {
    const __dirname = dirname(fileURLToPath(import.meta.url));
    return path.join(__dirname + `/dist/src/pages/${name}.html`);
}

app.get('/', (req, res) => {
    res.sendFile(usePage('index'));
});

const env = process.env.NODE_ENV || 'development'; 
if (env == 'development') {
    app.get('/live-server', reload.connect);
    app.post('/live-server', reload.notify);
}

// no route found
app.get('*', (req, res) => {
    res.sendFile(usePage('404'));
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});