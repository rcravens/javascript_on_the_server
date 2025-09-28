import fs from "fs/promises";
import Person from "./Person.js";

const data_path = "people.json";

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
    const people = await read_json(data_path);

    for (const p of people) {
        await Person.create(p.first_name, p.last_name, p.email);
    }

    console.log(`Seeded ${people.length} people from ${data_path}`);
}