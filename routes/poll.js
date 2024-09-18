import env from "../js/server_env.js";

export const DEV_ROUTE = true;

export default function(req, res) {
    res.setHeader("Content-Type", "text/javascript");
    res.end(`
        const eventSource = new EventSource('http://localhost:${env.getLiveServerPort()}');
        eventSource.onmessage = async (event) => {
            eventSource.close();
            // refresh page on update
            location.reload();
        }
    `);
}