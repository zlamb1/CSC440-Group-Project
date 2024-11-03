import { defineConfig } from 'vite';
import { vitePlugin as remix } from "@remix-run/dev";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
    plugins: [
        remix(),
        tsconfigPaths(),
    ],
    resolve: {
        alias: {
            ".prisma/client/index-browser": "./node_modules/.prisma/client/index-browser.js"
        }
    }
});