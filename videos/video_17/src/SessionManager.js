import {randomBytes} from "crypto";
import {fileURLToPath} from "url";
import fs from "fs";
import path from "path";


class SessionManager {
    constructor({storage_dir: storage_dir = null, max_age_seconds: max_age_seconds = 3600} = {}) {
        this.sessions = {};
        this.storage_dir = storage_dir;
        this.max_age_in_milliseconds = max_age_seconds * 1000;
        if (storage_dir) fs.mkdirSync(storage_dir, {recursive: true});
    }

    generateId() {
        return randomBytes(16).toString("hex");
    }

    createSession() {
        const id = this.generateId();
        this.sessions[id] = {flash: {}, lastAccess: Date.now()}; // initialize flash container
        if (this.storage_dir) this.saveSessionToFile(id);
        return id;
    }

    getSession(id) {
        if (!id) return null;
        if (this.sessions[id]) return this.sessions[id];
        if (this.storage_dir) {
            const filePath = path.join(this.storage_dir, `${id}.json`);
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
        if (!this.storage_dir || !this.sessions[id]) return;
        const filePath = path.join(this.storage_dir, `${id}.json`);
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
                if (this.storage_dir) this.saveSessionToFile(sessionId);
                return true;
            },
            deleteProperty: (target, prop) => {
                delete target[prop];
                if (this.storage_dir) this.saveSessionToFile(sessionId);
                return true;
            }
        });

        req.session.lastAccess = Date.now();

        // Flash helper methods
        req.flash = {
            set: (key, value) => {
                req.session.flash[key] = value;
                if (this.storage_dir) this.saveSessionToFile(sessionId);
            },
            get: (key) => {
                const value = req.session.flash[key];
                delete req.session.flash[key];  // remove after reading
                if (this.storage_dir) this.saveSessionToFile(sessionId);
                return value;
            },
            all: () => {
                const value = {...req.session.flash};
                req.session.flash = {};  // clear all flash
                if (this.storage_dir) this.saveSessionToFile(sessionId);
                return value;
            }
        };

        res.setHeader("Set-Cookie", `SID=${sessionId}; HttpOnly; Path=/; Max-Age=3600`);
    }

    cleanUpSessions() {
        console.log('cleaning old sessions');
        const now = Date.now();

        // In-memory sessions
        for (const id in this.sessions) {
            const session = this.sessions[id];
            if (session.lastAccess && now - session.lastAccess > this.max_age_in_milliseconds) {
                delete this.sessions[id];
            }
        }

        // Disk sessions
        if (this.storage_dir) {
            const files = fs.readdirSync(this.storage_dir);
            for (const file of files) {
                if (!file.endsWith(".json")) continue;
                const filePath = path.join(this.storage_dir, file);
                try {
                    const data = JSON.parse(fs.readFileSync(filePath));
                    if (data.lastAccess && now - data.lastAccess > this.max_age_in_milliseconds) {
                        fs.unlinkSync(filePath);
                        delete this.sessions[file.replace(".json", "")];
                    }
                } catch (err) {
                    console.error("Failed to read session file:", file, err);
                }
            }
        }
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
export const sessionManager = new SessionManager({storage_dir: storage_dir});

sessionManager.cleanUpSessions();

setInterval(() => {
    sessionManager.cleanUpSessions();
}, 10 * 60 * 1000);  // every 10 minutes