import path from "path";
import {fileURLToPath} from "url";
import fs from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "../data");

async function read_json(file_path) {
    try {
        const data = await fs.readFile(file_path, "utf-8");
        return JSON.parse(data);
    } catch (err) {
        if (err.code === "ENOENT") {
            return []; // File not found → return empty array
        }
        console.error("Error reading file:", err);
        throw err;
    }
}

async function write_json(file_path, data) {
    try {
        await fs.writeFile(file_path, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Error writing file:", err);
        throw err;
    }
}

export class BaseModel {
    static file_name = null; // e.g. "users.json"
    static key_field = "id"; // default key field

    static get file_path() {
        return path.join(DATA_DIR, this.file_name);
    }

    // ------ All: fetch all records
    static async all() {
        return await read_json(this.file_path);
    }

    // ------ Find: by key
    static async find(key) {
        const records = await read_json(this.file_path);
        return records.find((r) => r[this.key_field] === key) || null;
    }

    // ------ Create: fail if exists
    static async create(attrs) {
        const records = await read_json(this.file_path);
        console.log(records);
        const exists = records.find((r) => r[this.key_field] === attrs[this.key_field]);
        console.log(exists);
        if (exists) return null;

        records.push(attrs);
        await write_json(this.file_path, records);
        return attrs;
    }

    // ------ Update: overwrite existing record
    static async update(key, attrs) {
        const records = await read_json(this.file_path);
        const index = records.findIndex((r) => r[this.key_field] === key);
        if (index === -1) return null;

        records[index] = {...records[index], ...attrs};
        await write_json(this.file_path, records);
        return records[index];
    }

    // ------ Delete: by key
    static async delete(key) {
        const records = await read_json(this.file_path);
        const index = records.findIndex((r) => r[this.key_field] === key);
        if (index === -1) return null;

        const [removed] = records.splice(index, 1);
        await write_json(this.file_path, records);
        return removed;
    }
}