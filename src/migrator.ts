import {Migrate} from "./classes/migrate.js";

const migrate: Migrate = await Migrate.getInstance();

const args: string[] = process.argv.slice(2);
const methodName: MigrateMethods = args[0] as MigrateMethods;

if (methodName) {
    try {
        await migrate[methodName](args);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
} else {
    console.error(`Method named ${methodName} not found`);
}