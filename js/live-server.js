import express from 'express';

import env from './env.js';
import reload from './reload.js';

const app = express();

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', `http://localhost:${env.getWebServerPort()}`);
    next(); 
});

app.get('*', reload.connect);
app.post('*', reload.notify); 

app.listen(env.getLiveServerPort()); 