import ejs from "ejs";
import {fileURLToPath} from "url";
import {dirname, join} from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const LAYOUT_TEMPLATE = join(__dirname, "../views/layouts/layout.ejs");
const VIEWS_ROOT = join(__dirname, "../views");

export class BaseController {
    async render(res, view_path, data = {}) {
        try {
            const content = await ejs.renderFile(view_path, data);
            const html = await ejs.renderFile(LAYOUT_TEMPLATE, {body: content});

            res.writeHead(200, {"Content-Type": "text/html"});
            res.end(html);
        } catch (err) {
            console.error("Render error:", err);
            this.error(res, 500, "Error rendering page");
        }
    }

    async view(res, short_path, data = {}) {
        // Convert "users/index" → /views/users/index.ejs
        const view_path = join(VIEWS_ROOT, `${short_path}.ejs`);
        return this.render(res, view_path, data);
    }

    redirect(res, route) {
        res.writeHead(302, {Location: route});
        res.end();
    }

    error(res, status_code, message) {
        res.writeHead(status_code, {"Content-Type": "text/plain"});
        res.end(message);
    }
}