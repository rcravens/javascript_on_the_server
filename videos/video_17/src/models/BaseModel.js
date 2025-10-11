import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, "../data");

async function read_json(filePath) {
    try {
        const data = await fs.readFile(filePath, "utf-8");
        return JSON.parse(data);
    } catch (err) {
        if (err.code === "ENOENT") {
            return []; // File not found → return empty array
        }
        console.error("Error reading file:", err);
        throw err;
    }
}

async function write_json(filePath, data) {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Error writing file:", err);
        throw err;
    }
}

export class BaseModel {
    static fileName = null; // e.g. "people.json"
    static keyField = "id"; // default key field

    static get filePath() {
        return path.join(dataDir, this.fileName);
    }

    // ------ All: fetch all records
    static async all() {
        return await read_json(this.filePath);
    }

    // ------ Find: by key
    static async find(key) {
        const records = await read_json(this.filePath);
        return records.find((r) => r[this.keyField] === key) || null;
    }

    // ------ Create: fail if exists
    static async create(attrs) {
        const records = await read_json(this.filePath);
        const exists = records.find((r) => r[this.keyField] === attrs[this.keyField]);
        if (exists) return null;

        records.push(attrs);
        await write_json(this.filePath, records);
        return attrs;
    }

    // ------ Update: overwrite existing record
    static async update(key, attrs) {
        const records = await read_json(this.filePath);
        const index = records.findIndex((r) => r[this.keyField] === key);
        if (index === -1) return null;

        records[index] = { ...records[index], ...attrs };
        await write_json(this.filePath, records);
        return records[index];
    }

    // ------ Delete: by key
    static async delete(key) {
        const records = await read_json(this.filePath);
        const index = records.findIndex((r) => r[this.keyField] === key);
        if (index === -1) return null;

        const [removed] = records.splice(index, 1);
        await write_json(this.filePath, records);
        return removed;
    }
}