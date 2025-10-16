import ejs from "ejs";
import {fileURLToPath} from "url";
import {dirname, join} from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const layout_template = join(__dirname, "../views/layouts/layout.ejs");
const views_root = join(__dirname, "../views");

export class BaseController {
    async render(res, view_path, data = {}) {
        try {
            const content = await ejs.renderFile(view_path, data);
            const html = await ejs.renderFile(layout_template, {...data, body: content});

            res.writeHead(200, {"Content-Type": "text/html"});
            res.end(html);
        } catch (err) {
            console.error("Render error:", err);
            this.error(res, 500, "Error rendering page");
        }
    }

    async view(res, short_path, data = {}, req = null) {
        if (req) {
            // Add helpers
            const flash_errors = req.flash.get("errors") || {};
            const flash_body = req.flash.get("body") || {};
            const flash_success = req.flash.get("success") || null;
            const flash_alert = req.alert.get();

            data.old = (field, defaultValue = '') => flash_body[field] || defaultValue;
            data.error = (field) => flash_errors[field] || '';
            data.success = flash_success;
            data.auth = {
                user: req.auth.user ? req.auth.user.get() : null
            }
            data.alert = flash_alert;
        }

        // Convert "person/index" → /views/person/index.ejs
        const view_path = join(views_root, `${short_path}.ejs`);
        return this.render(res, view_path, data);
    }

    redirect(res, route) {
        res.writeHead(302, {Location: route});
        res.end();
    }

    back(req, res, flash_data = {}) {
        // Store flash data
        if (req.flash) {
            for (const key in flash_data) {
                req.flash.set(key, flash_data[key]);
            }
        }

        // Redirect to referer if present, else fallback to root
        const redirect_url = req.headers?.referer || "/";
        res.writeHead(302, {Location: redirect_url});
        res.end();
    }

    error(res, status_code, message) {
        res.writeHead(status_code, {"Content-Type": "text/plain"});
        res.end(message);
    }
}