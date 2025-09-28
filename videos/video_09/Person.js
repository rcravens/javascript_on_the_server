import fs from "fs/promises";

const data_path = "people.json";

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

export default class Person {
    constructor(first_name, last_name, email) {
        this.first_name = first_name;
        this.last_name = last_name;
        this.email = email;
    }

    // ------ Create: insert new, fail if already exists
    static async create(first_name, last_name, email) {
        const people = await read_json(data_path);
        const exists = people.find((person) => person.email === email);
        if (exists) return null;

        const person = new Person(first_name, last_name, email);
        people.push(person);
        await write_json(data_path, people);
        return person;
    }

    // ------ Read: find by email
    static async read(email) {
        const people = await read_json(data_path);
        const person = people.find((p) => p.email === email);
        return person || null;
    }

    // ------ Update: update first/last name by email
    static async update(first_name, last_name, email) {
        const people = await read_json(data_path);
        const index = people.findIndex((p) => p.email === email);
        if (index === -1) return null;

        people[index].first_name = first_name;
        people[index].last_name = last_name;

        await write_json(data_path, people);
        return people[index];
    }

    // ------ Delete: remove by email
    static async delete(email) {
        const people = await read_json(data_path);
        const index = people.findIndex((p) => p.email === email);
        if (index === -1) return null;

        const [removed_person] = people.splice(index, 1);
        await write_json(data_path, people);
        return removed_person;
    }
}