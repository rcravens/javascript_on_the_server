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

    #generate_id() {
        return randomBytes(16).toString("hex");
    }

    #create_session() {
        const id = this.#generate_id();
        this.sessions[id] = {flash: {}}; // initialize flash container
        if (this.storage_dir) this.#save_session_to_file(id);
        return id;
    }

    #get_session(id) {
        if (!id) return null;
        if (this.sessions[id]) return this.sessions[id];
        if (this.storage_dir) {
            const file_path = path.join(this.storage_dir, `${id}.json`);
            if (fs.existsSync(file_path)) {
                const data = JSON.parse(fs.readFileSync(file_path));
                this.sessions[id] = data;
                if (!this.sessions[id].flash) this.sessions[id].flash = {};
                return data;
            }
        }
        return null;
    }

    #destroy_session(req, res) {
        const cookies = this.#parse_cookies(req);
        const sessionId = cookies["SID"];
        if (!sessionId) return;

        // Remove from in-memory store
        delete this.sessions[sessionId];

        // Remove from disk if using storageDir
        if (this.storage_dir) {
            const file_path = path.join(this.storage_dir, `${sessionId}.json`);
            if (fs.existsSync(file_path)) {
                fs.unlinkSync(file_path);
            }
        }

        // Clear the cookie (set expiry in the past)
        res.setHeader("Set-Cookie", "SID=; HttpOnly; Path=/; Max-Age=0");

        // Clean up req
        if (req.session) delete req.session;
        if (req.user) delete req.user;
        if (req.flash) delete req.flash;
        if (req.alert) delete req.alert;
    }

    #save_session_to_file(id) {
        if (!this.storage_dir || !this.sessions[id]) return;
        const filePath = path.join(this.storage_dir, `${id}.json`);
        fs.writeFileSync(filePath, JSON.stringify(this.sessions[id], null, 2));
    }

    clean_up_sessions() {
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
                const file_path = path.join(this.storage_dir, file);
                try {
                    const data = JSON.parse(fs.readFileSync(file_path));
                    if (data.lastAccess && now - data.lastAccess > this.max_age_in_milliseconds) {
                        fs.unlinkSync(file_path);
                        delete this.sessions[file.replace(".json", "")];
                    }
                } catch (err) {
                    console.error("Failed to read session file:", file, err);
                }
            }
        }
    }

    attach(req, res) {
        const cookies = this.#parse_cookies(req);
        let session_id = cookies["SID"];

        if (!session_id || !this.#get_session(session_id)) {
            session_id = this.#create_session();
        }

        let session = this.#get_session(session_id);

        // Auto-save changes to session
        req.session = new Proxy(session, {
            set: (target, prop, value) => {
                target[prop] = value;
                if (this.storage_dir) this.#save_session_to_file(session_id);
                return true;
            },
            deleteProperty: (target, prop) => {
                delete target[prop];
                if (this.storage_dir) this.#save_session_to_file(session_id);
                return true;
            }
        });

        req.session.lastAccess = Date.now();

        // Flash helper methods
        req.flash = {
            set: (key, value) => {
                req.session.flash[key] = value;
                if (this.storage_dir) this.#save_session_to_file(session_id);
            },
            get: (key) => {
                const value = req.session.flash[key];
                delete req.session.flash[key];  // remove after reading
                if (this.storage_dir) this.#save_session_to_file(session_id);
                return value;
            },
            all: () => {
                const value = {...req.session.flash};
                req.session.flash = {};  // clear all flash
                if (this.storage_dir) this.#save_session_to_file(session_id);
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

        // Helper for logged-in user
        req.auth = {
            user: {
                get: () => req.session.user || null,
                set: (userObj) => {
                    req.session.user = userObj;
                    if (this.storage_dir) this.#save_session_to_file(session_id);
                },
                clear: () => {
                    this.#destroy_session(req, res);  // destroy current session
                    this.attach(req, res);          // start a fresh session
                }
            }
        };

        res.setHeader("Set-Cookie", `SID=${session_id}; HttpOnly; Path=/`);
    }

    #parse_cookies(req) {
        const list = {};
        const cookie_header = req.headers.cookie || "";
        cookie_header.split(";").forEach(cookie => {
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


sessionManager.clean_up_sessions();

setInterval(() => {
    sessionManager.clean_up_sessions();
}, 60 * 1000);  // every 1 minute