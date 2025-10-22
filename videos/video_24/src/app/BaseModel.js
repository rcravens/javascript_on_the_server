import path from "path";
import {fileURLToPath} from "url";
import {JsonStorage} from "./helpers/JsonStorage.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, "../data");

export class BaseModel {
    static fileName = null; // e.g. "people.json"
    static keyField = "id"; // default key field

    static get file_path() {
        return path.join(dataDir, this.fileName);
    }

    // ------ Helper: instantiate record into subclass instance
    static instantiate(record) {
        if (!record) return null;
        const instance = Object.create(this.prototype);
        Object.assign(instance, record);
        return instance;
    }

    // ------ Overwrite the existing records
    static async overwrite(records) {
        const filePath = this.file_path;

        // Ensure it's always an array
        const data = Array.isArray(records) ? records : [];

        // Write pretty JSON
        JsonStorage.write(filePath, data);

        return data;
    }

    // ------ All: fetch all records
    static async all() {
        const records = JsonStorage.read(this.file_path);
        return records.map(r => this.instantiate(r));
    }

    // ------ Find: by key
    static async find(key) {
        const records = JsonStorage.read(this.file_path);
        const found = records.find(r => r[this.keyField] === key);
        return this.instantiate(found);
    }

    // ------ Create: fail if exists
    static async create(attrs) {
        const records = JsonStorage.read(this.file_path);
        const exists = records.find((r) => r[this.keyField] === attrs[this.keyField]);
        if (exists) return null;

        records.push(attrs);
        JsonStorage.write(this.file_path, records);
        return this.instantiate(attrs);
    }

    // ------ Update: overwrite existing record
    static async update(key, attrs) {
        const records = JsonStorage.read(this.file_path);
        const index = records.findIndex((r) => r[this.keyField] === key);
        if (index === -1) return null;

        records[index] = {...records[index], ...attrs};
        JsonStorage.write(this.file_path, records);
        return this.instantiate(records[index]);
    }

    // ------ Delete: by key
    static async delete(key) {
        const records = JsonStorage.read(this.file_path);
        const index = records.findIndex((r) => r[this.keyField] === key);
        if (index === -1) return null;

        const [removed] = records.splice(index, 1);
        JsonStorage.write(this.file_path, records);
        return this.instantiate(removed);
    }
}