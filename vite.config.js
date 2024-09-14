import { resolve } from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react'

const port = process.env.PORT || 8080;

export default defineConfig({
    plugins: [ 
        react(),
        {
            name: 'live-server',
            enforce: 'post',
            writeBundle() {
                fetch(`http://localhost:${port}/live-server`, {
                    method: 'POST'
                });
            }
        }
    ],
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, '/src/pages/index.html'),
                '404': resolve(__dirname, '/src/pages/404.html')
            },
        },
    },
});