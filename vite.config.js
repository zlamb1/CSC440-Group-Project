import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import env from './js/env.js';

export default defineConfig({
    plugins: [ 
        react(),
        {
            name: 'live-server',
            enforce: 'post',
            writeBundle() {
                fetch(`http://localhost:${env.getLiveServerPort()}/live-server`, {
                    method: 'POST'
                }).catch(() => {});
            }
        }
    ],
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, '/src/pages/index.html'),
                '404': resolve(__dirname, '/src/pages/404.html')
            },
            external: [
                '/poll.js'
            ]
        },
    },
});