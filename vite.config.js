import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from "fs";
import path, {extname} from "path";

import env from './js/server_env.js';

function getHTMLFiles(filePath) {
    const pages = [];
    fs.readdirSync(filePath, {withFileTypes: true}).forEach(file => {
        const ext = extname(file.name);
        if (file.isFile() && ext === '.html') {
            pages.push(path.join(filePath, file.name));
        }
    });
    return pages;
}

export default defineConfig({
    plugins: [ 
        react({
            babel: {
                babelrc: true
            }
        }),
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
                ...getHTMLFiles('./src/pages/'),
            },
            external: [
                '/poll'
            ]
        },
    },
});