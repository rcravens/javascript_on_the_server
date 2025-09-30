import fs from "fs/promises";

async function write_json(path, data) {
    try {
        await fs.writeFile(path, JSON.stringify(data, null, 2));
        console.log("Data saved!");
    } catch (err) {
        console.error("Error writing file:", err);
    }
}

const data_path = "users2.json";

let users = [];
const user = {
    "first_name": "Bob",
    "last_name": "Cravens",
    "email": "bcravens@example.com"
}
users.push(user);

await write_json(data_path, users);
