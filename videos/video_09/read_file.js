import fs from "fs/promises";

async function read_json(path) {

    try {
        const data = await fs.readFile(path, "utf-8");
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading file:", err);
    }
}

const data_path = "people.json";

let people = await read_json(data_path);

console.log(people);
console.log(people[0]);
console.log(people[0].email);