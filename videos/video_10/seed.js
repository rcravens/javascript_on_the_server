import fs from "fs/promises";
import User from "./User.js";

const data_path = "users.json";

async function read_json(path) {
    try {
        const data = await fs.readFile(path, "utf-8");
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading file:", err);
        return [];
    }
}

export async function seed_db() {
    const users = await read_json(data_path);

    for (const user of users) {
        await User.create(user.first_name, user.last_name, user.email);
    }

    console.log(`Seeded ${users.length} users from ${data_path}`);
}
