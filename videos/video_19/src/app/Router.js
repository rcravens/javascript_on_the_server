export default class Router {
    constructor() {
        this.routes = [];
        this._current_group_middleware = [];
    }

    static parseBody(req) {
        return new Promise((resolve, reject) => {
            let data = '';
            req.on('data', chunk => data += chunk);
            req.on('end', () => {
                try {
                    const contentType = req.headers['content-type'] || '';
                    if (contentType.includes('application/json')) {
                        resolve(JSON.parse(data || '{}'));
                    } else if (contentType.includes('application/x-www-form-urlencoded')) {
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

    #register(method, path, controllerClass, handlerName) {
        const parts = path.split("/").filter(Boolean);
        this.routes.push({method, parts, controllerClass, handlerName});
    }

    get(path, controllerClass, handlerName) {
        this.#register("GET", path, controllerClass, handlerName);
    }

    post(path, controllerClass, handlerName) {
        this.#register("POST", path, controllerClass, handlerName);
    }

    put(path, controllerClass, handlerName) {
        this.#register("PUT", path, controllerClass, handlerName);
    }

    patch(path, controllerClass, handlerName) {
        this.#register("PATCH", path, controllerClass, handlerName);
    }

    delete(path, controllerClass, handlerName) {
        this.#register("DELETE", path, controllerClass, handlerName);
    }

    async handle(req, res, method, urlParts) {
        for (const route of this.routes) {
            if (route.method !== method) continue;
            if (route.parts.length !== urlParts.length) continue;

            const params = {};
            let matched = true;

            for (let i = 0; i < route.parts.length; i++) {
                if (route.parts[i].startsWith(":")) {
                    params[route.parts[i].substring(1)] = urlParts[i];
                } else if (route.parts[i] !== urlParts[i]) {
                    matched = false;
                    break;
                }
            }

            if (!matched) continue;

            const controller = new route.controllerClass();
            if (!controller[route.handlerName])
                throw new Error(`Handler "${route.handlerName}" not found on controller`);

            let body = {};
            if (["POST", "PUT", "PATCH"].includes(method)) {
                body = await Router.parseBody(req);
            }

            return controller[route.handlerName](req, res, params, body);
        }

        res.writeHead(404, {"Content-Type": "text/plain"});
        res.end("Not Found");
    }
}