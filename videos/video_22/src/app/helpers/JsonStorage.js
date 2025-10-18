import fs from "fs";

export class JsonStorage {
    // ---- Read JSON safely
    static read(filePath, defaultValue = []) {
        try {
            const data = fs.readFileSync(filePath, "utf-8");
            return JSON.parse(data);
        } catch (err) {
            if (err.code === "ENOENT") {
                // File doesn’t exist → return default
                return defaultValue;
            }
            console.error(`Error reading file: ${filePath}`, err);
            throw err;
        }
    }

    // ---- Write JSON safely
    static write(filePath, data) {
        try {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        } catch (err) {
            console.error(`Error writing file: ${filePath}`, err);
            throw err;
        }
    }
}