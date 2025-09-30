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
            const html = await ejs.renderFile(layout_template, {...data, body: content});

            res.writeHead(200, {"Content-Type": "text/html"});
            res.end(html);
        } catch (err) {
            console.error("Render error:", err);
            this.error(res, 500, "Error rendering page");
        }
    }

    async view(res, shortPath, data = {}, req = null) {
        if (req) {
            // Add helpers
            const flashErrors = req.flash.get("errors") || {};
            const flashBody = req.flash.get("body") || {};
            const flashSuccess = req.flash.get("success") || null;
            const flashAlert = req.alert.get();

            data.old = (field, defaultValue = '') => flashBody[field] || defaultValue;
            data.error = (field) => flashErrors[field] || '';
            data.success = flashSuccess;
            data.user = req.user ? req.user.get() : null;
            data.alert = flashAlert;
        }

        // Convert "person/index" → /views/person/index.ejs
        const viewPath = join(views_root, `${shortPath}.ejs`);
        return this.render(res, viewPath, data);
    }

    redirect(res, path) {
        res.writeHead(302, {Location: path});
        res.end();
    }

    back(req, res, flashData = {}) {
        // Store flash data
        if (req.flash) {
            for (const key in flashData) {
                req.flash.set(key, flashData[key]);
            }
        }

        // Redirect to referer if present, else fallback to root
        const redirectUrl = req.headers?.referer || "/";
        res.writeHead(302, {Location: redirectUrl});
        res.end();
    }

    error(res, statusCode, message) {
        res.writeHead(statusCode, {"Content-Type": "text/plain"});
        res.end(message);
    }
}