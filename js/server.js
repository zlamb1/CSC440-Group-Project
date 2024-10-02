import env from "./env.js";
import http from "http";

function handleClose(servers) {
    for (const server of servers) {
        console.log(`Closing server on port ${server.address().port}`);
        server.close();
    }
    process.exit();
}

export function createServer(app) {
    const servers = [];
    const ports = env.getWebServerPorts();
    const httpServer = http.createServer(app);
    servers.push(httpServer);
    httpServer.listen(ports.http, () => {
        console.log(`HTTP server listening on port ${ports.http}.`);
    });
    process.on('SIGINT', () => handleClose(servers));
    process.on('SIGTERM', () => handleClose(servers));
    return servers;
}