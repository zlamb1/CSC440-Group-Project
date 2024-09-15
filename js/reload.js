const clients = []; 
export default {
    connect: async (req, res) => {
        // send headers to keep connection alive
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        });
        clients.push(res); 
        // listen for client 'close' requests
        req.on('close', () => { 
            const index = clients.indexOf(res); 
            if (index > -1) {
                clients.splice(index, 1); 
            }
        });
    },
    notify: async () => {
        for (const client of clients) {
            client.write('event: message\n');
            client.write('data: update\n\n'); 
        }
    }
};