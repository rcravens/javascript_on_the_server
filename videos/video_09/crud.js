import Person from "./Person.js";

// Example usage
const new_person = await Person.create("Bob", "Cravens", "bcravens@example.com");
console.log("Create:", new_person);

const person_read = await Person.read("bcravens@example.com");
console.log("Read:", person_read);

const person_updated = await Person.update("Robert", "Cravens", "bcravens@example.com");
console.log("Update:", person_updated);

const person_deleted = await Person.delete("bcravens@example.com");
console.log("Delete:", person_deleted);