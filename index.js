const express = require('express');
const path = require('path');
const reload = require('./js/reload.js'); 

const app = express();
const port = process.env.PORT || 8080; 

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/index.html'));
});

app.get('/live-server', reload.connect);
// watch files for changes and notify clients
reload.watch(); 

// no route found
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/404.html'));
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});