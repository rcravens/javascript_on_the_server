import ejs from "ejs";
import {fileURLToPath} from "url";
import {dirname, join} from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const layout_template = join(__dirname, "../views/layouts/layout.ejs");
const views_root = join(__dirname, "../views");

export class BaseController {
    async render(res, viewPath, data = {}) {
        try {
            const content = await ejs.renderFile(viewPath, data);
            const html = await ejs.renderFile(layout_template, {body: content});

            res.writeHead(200, {"Content-Type": "text/html"});
            res.end(html);
        } catch (err) {
            console.error("Render error:", err);
            this.error(res, 500, "Error rendering page");
        }
    }

    async view(res, shortPath, data = {}) {
        // Convert "person/index" → /views/person/index.ejs
        const viewPath = join(views_root, `${shortPath}.ejs`);
        return this.render(res, viewPath, data);
    }

    redirect(res, route) {
        res.writeHead(302, {Location: route});
        res.end();
    }

    error(res, statusCode, message) {
        res.writeHead(statusCode, {"Content-Type": "text/plain"});
        res.end(message);
    }
}