import express from 'express';
import open from 'open'; 

import env from '../server_env.js';
import reload from './reload.js';

const app = express();

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', `http://localhost:${env.getWebServerPorts().http}`);
    next(); 
});

let first = true;
app.get('*', reload.connect);
app.post('*', () => {
    if (first) {
        first = false; 
        open(`http://localhost:${env.getWebServerPorts().http}`);
    }
    reload.notify(); 
}); 

app.listen(env.getLiveServerPort()); 