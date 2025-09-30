import fs from "fs/promises";

const data_path = "users.json";

async function read_json(path) {
    try {
        const data = await fs.readFile(path, "utf-8");
        return JSON.parse(data);
    } catch (err) {
        if (err.code === "ENOENT") {
            return []; // Return an empty array if the file doesn't exist
        }
        console.error("Error reading file:", err);
        throw err;
    }
}

async function write_json(path, data) {
    try {
        await fs.writeFile(path, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Error writing file:", err);
        throw err;
    }
}

export default class User {
    constructor(first_name, last_name, email) {
        this.first_name = first_name;
        this.last_name = last_name;
        this.email = email;
    }

    // ------ All: fetch an array of all people
    static async all() {
        return await read_json(data_path);
    }


    // ------ Create: insert new, fail if already exists
    static async create(first_name, last_name, email) {
        const users = await read_json(data_path);
        const exists = users.find((u) => u.email === email);
        if (exists) return null;

        const user = new User(first_name, last_name, email);
        users.push(user);
        await write_json(data_path, users);
        return user;
    }

    // ------ Read: find by email
    static async read(email) {
        const users = await read_json(data_path);
        const user = users.find((u) => u.email === email);
        return user || null;
    }

    // ------ Update: update first/last name by email
    static async update(first_name, last_name, email) {
        const users = await read_json(data_path);
        const index = users.findIndex((u) => u.email === email);
        if (index === -1) return null;

        users[index].first_name = first_name;
        users[index].last_name = last_name;

        await write_json(data_path, users);
        return users[index];
    }

    // ------ Delete: remove by email
    static async delete(email) {
        const users = await read_json(data_path);
        const index = users.findIndex((u) => u.email === email);
        if (index === -1) return null;

        const [removed_user] = users.splice(index, 1);
        await write_json(data_path, users);
        return removed_user;
    }
}