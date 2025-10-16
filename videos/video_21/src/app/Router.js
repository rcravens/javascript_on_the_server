export default class Router {
    constructor() {
        this.routes = [];
        this._current_group_middleware = [];
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

            // Run middlewares in order
            for (const MiddlewareClass of route.middlewares) {
                const middleware = new MiddlewareClass();
                const result = await middleware.handle(req, res, params);
                if (result === false) return; // stop chain if middleware blocks
            }

            const controller = new route.controller_class();
            if (!controller[route.handler_name])
                throw new Error(`Handler "${route.handler_name}" not found on controller`);

            let body = {};
            if (["POST", "PUT", "PATCH"].includes(method)) {
                body = await Router.#parse_body(req);
            }

            return controller[route.handler_name](req, res, params, body);
        }

        res.writeHead(404, {"Content-Type": "text/plain"});
        res.end("Not Found");
    }
}