import {faker} from '@faker-js/faker';
import User from '../../models/User.js';

export default class UserSeeder {

    static async clear() {
        await User.overwrite([]); // assuming BaseModel supports overwriting file
        console.log("All existing people deleted.");
    }

    static async run(count = 10) {
        console.log(`Seeding ${count} people...`);

        for (let i = 0; i < count; i++) {
            const firstName = faker.person.firstName();
            const lastName = faker.person.lastName();
            const email = faker.internet.email({firstName, lastName}).toLowerCase();
            const password = faker.internet.password(8);
            const passwordHash = await User.hash_password(password);
            const is_admin = false;

            const user = new User(firstName, lastName, email, passwordHash, is_admin);

            // Save to people.json
            await User.create(user);

            // Log credentials
            console.log(`Created user: ${email} | Password: ${password}`);
        }

        console.log("Seeding complete.");
    }
}