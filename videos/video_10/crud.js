import User from "./User.js";
import {seed_db} from "./seed.js";

// Seed the database from JSON
await seed_db();

// Example usage
const user_created = await User.create("Bob", "Cravens", "bcravens@example.com");
console.log("Create:", user_created);

const user_read = await User.read("bcravens@example.com");
console.log("Read:", user_read);

const user_updated = await User.update("Robert", "Cravens", "bcravens@example.com");
console.log("Update:", user_updated);

const user_deleted = await User.delete("bcravens@example.com");
console.log("Delete:", user_deleted);