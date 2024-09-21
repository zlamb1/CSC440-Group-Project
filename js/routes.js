import fs from "fs";
import path, {extname} from "path";

const isProduction = process.env.NODE_ENV === 'production';

export function resolveRoutes(path, initialPath, resolved) {
    initialPath = initialPath ?? path;
    resolved = resolved ?? [];
    fs.readdirSync(path, {withFileTypes: true}).forEach(function(file) {
        const ext = extname(file.name);
        if (file.isDirectory()) {
            return resolveRoutes(file.path + '/' + file.name, initialPath, resolved);
        } else if (ext === '.js') {
            resolved.push({
                path: file.path + '/' + file.name,
                route: file.path.replace(initialPath, '') + '/' + file.name.substring(0, file.name.lastIndexOf('.'))
            });
        }
    });
    return resolved;
}

export async function mapRoutes(app, routes, __dirname) {
    function usePage(name) {
        return path.join(__dirname + `/dist/src/pages/${name}.html`);
    }
    for (const route of routes) {
        const routeImport = await import(route.path);
        if (!isProduction || !routeImport?.DEV_ROUTE) {
            if (route.route === '/index') route.route = '/';
            ['get', 'post', 'put', 'delete'].forEach(method => {
                if (method === 'get' && !routeImport['get'] && routeImport.default) {
                    app.get(route.route, (req, res, next) => {
                        routeImport.default(req, res, next, usePage);
                    })
                }
                if (routeImport[method]) {
                    app[method](route.route, (req, res, next) => {
                        routeImport[method](req, res, next, usePage);
                    });
                }
            });
        }
    }
}