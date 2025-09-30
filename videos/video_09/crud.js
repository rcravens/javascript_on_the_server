import User from "./User.js";

// Example usage
const new_person = await User.create("Bob", "Cravens", "bcravens@example.com");
console.log("Create:", new_person);

const person_read = await User.read("bcravens@example.com");
console.log("Read:", person_read);

const person_updated = await User.update("Robert", "Cravens", "bcravens@example.com");
console.log("Update:", person_updated);

const person_deleted = await User.delete("bcravens@example.com");
console.log("Delete:", person_deleted);