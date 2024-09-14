const path = require('path');
const express = require('express');

const app = express();
const port = process.env.PORT || 8080; 

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/index.html'));
});

// no route found
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/404.html'));
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});