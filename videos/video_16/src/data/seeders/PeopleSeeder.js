import {faker} from '@faker-js/faker';
import Person from '../../models/Person.js';

export default class PeopleSeeder {

    static async clear() {
        await Person.overwrite([]); // assuming BaseModel supports overwriting file
        console.log("All existing people deleted.");
    }

    static async run(count = 10) {
        console.log(`Seeding ${count} people...`);

        for (let i = 0; i < count; i++) {
            const firstName = faker.person.firstName();
            const lastName = faker.person.lastName();
            const email = faker.internet.email({firstName, lastName}).toLowerCase();
            const password = faker.internet.password(8);
            const passwordHash = await Person.hashPassword(password);
            const is_admin = false;

            const person = new Person(firstName, lastName, email, passwordHash, is_admin);

            // Save to people.json
            await Person.create(person);

            // Log credentials
            console.log(`Created user: ${email} | Password: ${password}`);
        }

        console.log("Seeding complete.");
    }
}