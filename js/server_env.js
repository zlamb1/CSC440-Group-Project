export default {
    getWebServerPorts: () => {
        const isProduction = process.env.NODE_ENV === 'production';
        const isUnprivileged = process.env.SERVER_UNPRIV;
        return {
            http: process.env.HTTP_PORT || (isProduction ? 80 : 8080),
            https: process.env.HTTPS_PORT || (isProduction ? 443 : 8443),
        }
    },
    getLiveServerPort: () => {
        return process.env.LIVE_SERVER_PORT || 8081;
    }
}