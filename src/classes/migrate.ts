import { DataBase } from "./data_base.js";
import fs from "fs/promises";
import * as dgram from "dgram";
interface Migration {
    up(): Promise<void>;
    down(): Promise<void>;
}

export class Migrate {
    private static instance: Migrate | null = null;
    data_base: DataBase;
    migrations: { [key: string] : Migration }
    path_to_migrations: string;
    currentMigrationName: string | undefined;

    constructor(dataBase: DataBase, path_to_migrations: string, migrations: { [key: string] : Migration }, currentMigrationName: string | undefined) {
        this.data_base = dataBase;
        this.path_to_migrations = path_to_migrations;
        this.migrations = migrations;
        this.currentMigrationName = currentMigrationName;
    }

    static async getInstance(dataBase: DataBase, path_to_migrations: string): Promise<Migrate> {
        if (!Migrate.instance) {
            const migrations: { [key: string] : Migration } = await this.getMigrations(path_to_migrations);
            const currentMigrationName: string | undefined = await this.getCurrentMigrationName();
            Migrate.instance = new Migrate(dataBase, path_to_migrations, migrations, currentMigrationName);
        }
        return Migrate.instance;
    }

    async create(args: string[]){
        const name: string = args[1];
        const id: number = Date.now()
        const filePath: string = `${this.path_to_migrations}/${id}-${name}.js`;

        const content: string = `export default {
    async up(){
        /** some code */
    },
            
    async down(){
        /** some code */
    }
}`

        try {
            await fs.writeFile(filePath, content);
            console.log(`Файл ${id}-${name}.js успешно создан в директории ${this.path_to_migrations}`);
        } catch (error) {
            console.error('Ошибка при создании файла:', error);
        }

    }

    async up(args: string[]){
        const targetMigrationName: string = args[1];
        const keys: string[] = Object.keys(this.migrations);
        const targetMigrationPosition: number = keys.indexOf(targetMigrationName);

        if (targetMigrationPosition !== 0) {
            const currentMigrationPosition: number = keys.indexOf(this.currentMigrationName!)

            if (currentMigrationPosition < targetMigrationPosition) {

                for (let index: number = currentMigrationPosition + 1; index <= targetMigrationPosition; index++) {
                    await this.startMigration(keys[index], 'up');
                }

            } else {
                console.log('Incorrect operation! Target migration must been bigger then current migration.')
                return
            }

        } else {
            if (this.currentMigrationName) {
                console.log('Incorrect operation! Target migration must been bigger then current migration.')
                return
            }
            await this.startMigration(targetMigrationName, 'up');
        }

        await this.setCurrentMigrationName(targetMigrationName);
    }

    static async getCurrentMigrationName(): Promise<string | undefined>{
        try {
            const result: string = await fs.readFile('migrate_log.json', 'utf-8');
            const data = JSON.parse(result);
            return data.name;
        } catch (err){
            return undefined
        }
    }

    async setCurrentMigrationName(name: string | undefined) {
        this.currentMigrationName = name;
        if (!name) return await fs.unlink('./migrate_log.json');

        try {
            const content: object = {'name': this.currentMigrationName}
            await fs.writeFile('./migrate_log.json', JSON.stringify(content));
        } catch (err) {
            console.log(err);
        }
    }

    async down(args: string[]){
        let targetMigrationName: string | undefined = args[1];
        const keys: string[] = Object.keys(this.migrations);
        const targetMigrationPosition: number = keys.indexOf(targetMigrationName);

        if (this.currentMigrationName) {
            const currentMigrationPosition: number = keys.indexOf(this.currentMigrationName);

            if (currentMigrationPosition >= targetMigrationPosition) {

                for (let index: number = currentMigrationPosition; index >= targetMigrationPosition; index--) {
                    await this.startMigration(keys[index], 'down');
                }

            } else {
                console.log('Incorrect operation! Target migration must been smaller then current migration.')
                return
            }

        } else {
            console.log('Incorrect operation! Not a single migration has been completed.')
        }

        if(
            targetMigrationName && this.currentMigrationName &&
            !targetMigrationName.localeCompare(this.currentMigrationName)
        ) {
            await this.setCurrentMigrationName(keys[targetMigrationPosition - 1]);
        } else {
            targetMigrationName =
                targetMigrationPosition === 0 ? undefined : targetMigrationName;
            await this.setCurrentMigrationName(targetMigrationName);
        }
    }

    async startMigration(migrationName: string, methodName: 'up' | 'down'){
        const start: number = migrationName.indexOf('-') + 1;
        process.stdout.write(`${methodName} ${migrationName.substring(start)}: `);
        try {
            await this.migrations[migrationName][methodName]();
            console.log('Done')
        } catch (err){
            console.log('Fail')
            console.error(err);
        }
    }

    static async getMigrations(path: string): Promise<{ [key: string] : Migration }> {
        try {
            const files: string[] = await fs.readdir(path);
            const migrationFiles: string[] = files.filter((file) => file.endsWith(".js"));

            const migrations: { [key: string] : Migration } = {};

            for (const file of migrationFiles) {
                const key: string = file.substring(0, file.length - 3)
                const filePath: string = path + file;
                const { default: migrationObject } = await import (`../${filePath}`);

                if (
                    typeof migrationObject === "object" &&
                    typeof migrationObject.up === "function" &&
                    typeof migrationObject.down === "function"
                ) {
                    migrations[key] = migrationObject;
                } else {
                    console.warn(`Пропускается недопустимый файл миграции: ${filePath}`);
                }
            }

            return migrations;
        } catch (err) {
            console.error("Ошибка при чтении файлов миграции:", err);
            return {};
        }
    }

    async ls(): Promise<void> {
        const migration_names: string[] = Object.keys(this.migrations);
        if (migration_names.length > 0){
            console.log('Migration list:')
            migration_names.map(migrationName => {
                if (
                    typeof this.currentMigrationName == 'string' &&
                    !Boolean(migrationName.localeCompare(this.currentMigrationName))
                ) {
                    console.log(` - ${migrationName} <CURRENT`)
                } else {
                    console.log(` - ${migrationName}`)
                }
            });
        } else {
            console.log('Migration list is empty')
        }
    }
}