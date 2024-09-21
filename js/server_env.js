export default {
    getWebServerPorts: () => {
        return {
            http: process.env.HTTP_PORT || 8080,
            https: process.env.HTTPS_PORT || 8443,
        }
    },
    getLiveServerPort: () => {
        return process.env.LIVE_SERVER_PORT || 8081;
    }
}