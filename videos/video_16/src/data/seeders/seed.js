// seed.js
import UserSeeder from './UserSeeder.js';

const args = process.argv.slice(2);
const fresh = args.includes("--fresh");

// Default count
let count = 10;

// Look for --count=N
const countArg = args.find(arg => arg.startsWith("--count="));
if (countArg) {
    const [, value] = countArg.split("=");
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed) && parsed > 0) {
        count = parsed;
    }
}

(async () => {
    try {
        if (fresh) {
            await UserSeeder.clear();
        }

        await UserSeeder.run(count);
        process.exit(0);
    } catch (err) {
        console.error("Error during seeding:", err);
        process.exit(1);
    }
})();