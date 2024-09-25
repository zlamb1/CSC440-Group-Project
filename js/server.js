import fs from "fs";
import env from "./server_env.js";
import isProduction from "./prod.js";
import http from "http";
import https from "https";

function handleClose(servers) {
    for (const server of servers) {
        console.log(`Closing server on port ${server.address().port}`);
        server.close();
    }
    process.exit();
}

const isUnprivileged = process.env.SERVER_UNPRIV;
export function createServer(app) {
    const servers = [];
    if (isProduction && !isUnprivileged) {
        const ports = env.getWebServerPorts();
        try {
            const httpServer = http.createServer(app);
            servers.push(httpServer.listen(ports.http));
        } catch (err) {
            console.log('failed to start http server: ' + err);
        }
        try {
            const key = fs.readFileSync(process.env.KEY_PATH || '.key', 'utf-8');
            const cert = fs.readFileSync(process.env.CERT_PATH || '.pem', 'utf-8');
            const credentials = {key, cert};
            const httpsServer = https.createServer(credentials, app);
            servers.push(httpsServer.listen(ports.https));
        } catch (err) {
            console.log('failed to start https server: ' + err);
        }
    } else {
        servers.push(app.listen(env.getWebServerPorts().http, () => {
            console.log(`Server listening on port ${env.getWebServerPorts().http}`);
        }));
    }
    process.on('SIGINT', () => handleClose(servers));
    process.on('SIGTERM', () => handleClose(servers));
    return servers;
}