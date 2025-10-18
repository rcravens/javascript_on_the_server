import fs from "fs";
import mime from "mime-types";
import path from "path";


export default class Router {
    constructor(static_folder = null) {
        this.routes = [];
        this._current_group_middleware = [];
        this._static_folder = static_folder;
    }

    static #parse_body(req) {
        return new Promise((resolve, reject) => {
            let data = '';
            req.on('data', chunk => data += chunk);
            req.on('end', () => {
                try {
                    const content_type = req.headers['content-type'] || '';
                    if (content_type.includes('application/json')) {
                        resolve(JSON.parse(data || '{}'));
                    } else if (content_type.includes('application/x-www-form-urlencoded')) {
                        const params = new URLSearchParams(data);
                        resolve(Object.fromEntries(params.entries()));
                    } else {
                        resolve({});
                    }
                } catch (err) {
                    reject(err);
                }
            });
        });
    }

    #register(method, path, controller_class, handler_name, middlewares = []) {
        const combined_middleware = [...this._current_group_middleware, ...middlewares];

        const parts = path.split("/").filter(Boolean);
        this.routes.push({method, parts, controller_class, handler_name, middlewares: combined_middleware});
    }

    get(path, controller_class, handler_name, middlewares = []) {
        this.#register("GET", path, controller_class, handler_name, middlewares);
    }

    post(path, controller_class, handler_name, middlewares = []) {
        this.#register("POST", path, controller_class, handler_name, middlewares);
    }

    put(path, controller_class, handler_name, middlewares = []) {
        this.#register("PUT", path, controller_class, handler_name, middlewares);
    }

    patch(path, controller_class, handler_name, middlewares = []) {
        this.#register("PATCH", path, controller_class, handler_name, middlewares);
    }

    delete(path, controller_class, handler_name, middlewares = []) {
        this.#register("DELETE", path, controller_class, handler_name, middlewares);
    }

    group(middleware = [], callback) {
        const previous = this._current_group_middleware;
        this._current_group_middleware = [...previous, ...middleware];
        callback();
        this._current_group_middleware = previous; // restore
    }

    async handle(req, res, method, url_parts) {

        // --- Registered Routes
        for (const route of this.routes) {
            if (route.method !== method) continue;
            if (route.parts.length !== url_parts.length) continue;

            const params = {};
            let matched = true;

            for (let i = 0; i < route.parts.length; i++) {
                if (route.parts[i].startsWith(":")) {
                    params[route.parts[i].substring(1)] = url_parts[i];
                } else if (route.parts[i] !== url_parts[i]) {
                    matched = false;
                    break;
                }
            }

            if (!matched) continue;

            let body = {};
            if (["POST", "PUT", "PATCH"].includes(method)) {
                body = await Router.#parse_body(req);
            }

            // Run middlewares in order
            for (const middleware_class of route.middlewares) {
                const middleware = new middleware_class();
                const result = await middleware.handle(req, res, params, body);
                if (result === false) return; // stop chain if middleware blocks
            }

            const controller = new route.controller_class();
            if (!controller[route.handler_name])
                throw new Error(`Handler "${route.handler_name}" not found on controller`);

            return controller[route.handler_name](req, res, params, body);
        }

        // --- Fallback to Static Files
        if (this._static_folder) {
            let file_path = path.join(this._static_folder, ...url_parts);
            try {
                let stat = fs.statSync(file_path);

                if (stat.isDirectory()) {
                    const index_path = path.join(file_path, 'index.html');
                    if (fs.existsSync(index_path)) {
                        file_path = index_path;
                        stat = fs.statSync(file_path);
                    }
                }

                if (stat.isFile()) {
                    const mime_type = mime.lookup(file_path) || 'application/octet-stream';
                    res.writeHead(200, {'Content-Type': mime_type});
                    fs.createReadStream(file_path).pipe(res);
                    return;
                }
            } catch (err) {
                // ignore, will fall through to 404
            }
        }

        // --- 404 Response
        res.writeHead(404, {"Content-Type": "text/plain"});
        res.end("Not Found");
    }
}