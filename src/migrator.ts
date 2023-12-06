import {Migrate} from "./classes/migrate.js";
import {DataBase} from "./classes/data_base.js";

type MigrateMethod = 'create' | 'up' | 'down' | 'ls';

const dataBase: DataBase = await DataBase.getInstance();
const path_to_migrations: string = './migrations/';
const migrate: Migrate = await Migrate.getInstance(dataBase, path_to_migrations)

const args: string[] = process.argv.slice(2);
const methodName: MigrateMethod = args[0] as MigrateMethod;

if (methodName) {
    try {
        await migrate[methodName](args)
        process.exit();
    } catch (err){
        console.error(err)
        process.exit(1);
    }
} else {
    console.error(`Метод с названием ${methodName} не найден`);
}