import {randomBytes} from "crypto";
import {fileURLToPath} from "url";
import fs from "fs";
import path from "path";

class SessionManager {
    constructor({storageDir = null} = {}) {
        this.sessions = {};
        this.storageDir = storageDir;
        if (storageDir) fs.mkdirSync(storageDir, {recursive: true});
    }

    generateId() {
        return randomBytes(16).toString("hex");
    }

    createSession() {
        const id = this.generateId();
        this.sessions[id] = {flash: {}}; // initialize flash container
        if (this.storageDir) this.saveSessionToFile(id);
        return id;
    }

    getSession(id) {
        if (!id) return null;
        if (this.sessions[id]) return this.sessions[id];
        if (this.storageDir) {
            const filePath = path.join(this.storageDir, `${id}.json`);
            if (fs.existsSync(filePath)) {
                const data = JSON.parse(fs.readFileSync(filePath));
                this.sessions[id] = data;
                if (!this.sessions[id].flash) this.sessions[id].flash = {};
                return data;
            }
        }
        return null;
    }

    saveSessionToFile(id) {
        if (!this.storageDir || !this.sessions[id]) return;
        const filePath = path.join(this.storageDir, `${id}.json`);
        fs.writeFileSync(filePath, JSON.stringify(this.sessions[id], null, 2));
    }

    attach(req, res) {
        const cookies = this.parseCookies(req);
        let sessionId = cookies["SID"];

        if (!sessionId || !this.getSession(sessionId)) {
            sessionId = this.createSession();
        }

        let session = this.getSession(sessionId);

        // Auto-save changes to session
        req.session = new Proxy(session, {
            set: (target, prop, value) => {
                target[prop] = value;
                if (this.storageDir) this.saveSessionToFile(sessionId);
                return true;
            },
            deleteProperty: (target, prop) => {
                delete target[prop];
                if (this.storageDir) this.saveSessionToFile(sessionId);
                return true;
            }
        });

        // Flash helper methods
        req.flash = {
            set: (key, value) => {
                req.session.flash[key] = value;
                if (this.storageDir) this.saveSessionToFile(sessionId);
            },
            get: (key) => {
                const value = req.session.flash[key];
                delete req.session.flash[key];  // remove after reading
                if (this.storageDir) this.saveSessionToFile(sessionId);
                return value;
            },
            all: () => {
                const value = {...req.session.flash};
                req.session.flash = {};  // clear all flash
                if (this.storageDir) this.saveSessionToFile(sessionId);
                return value;
            }
        };

        // Alert helpers for flash message
        req.alert = {
            success: (message, title = '') => req.flash.set('alert', {type: 'success', message, title}),
            error: (message, title = '') => req.flash.set('alert', {type: 'error', message, title}),
            warn: (message, title = '') => req.flash.set('alert', {type: 'warning', message, title}),
            get: () => req.flash.get('alert') || null
        };

        res.setHeader("Set-Cookie", `SID=${sessionId}; HttpOnly; Path=/`);
    }

    user(sessionId) {
        const session = this.getSession(sessionId);
        return session ? session.user : null;
    }

    parseCookies(req) {
        const list = {};
        const cookieHeader = req.headers.cookie || "";
        cookieHeader.split(";").forEach(cookie => {
            const parts = cookie.split("=");
            if (parts.length === 2) list[parts[0].trim()] = decodeURIComponent(parts[1].trim());
        });
        return list;
    }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storage_dir = path.join(__dirname, "../data/sessions");
export const sessionManager = new SessionManager({storageDir: storage_dir});