export default {
    getWebServerPort: () => {
        return process.env.PORT || 8080; 
    },
    getLiveServerPort: () => {
        return process.env.LIVE_SERVER_PORT || 8081;
    }
}