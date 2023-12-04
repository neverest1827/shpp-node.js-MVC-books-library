import { DataBase } from "./data_base"
import fs from "fs/promises";
interface Migration {
    up(): Promise<void>;
    down(): Promise<void>;
}

export class Migrate {
    private static instance: Migrate | null = null;
    data_base: DataBase;
    migrations: { [key: string] : Migration }
    path_to_migrations: string;

    constructor(dataBase: DataBase, path_to_migrations: string, migrations: { [key: string] : Migration }) {
        this.data_base = dataBase;
        this.path_to_migrations = path_to_migrations;
        this.migrations = migrations;
    }

    static async getInstance(dataBase: DataBase, path_to_migrations: string): Promise<Migrate> {
        if (!Migrate.instance) {
            const migrations: { [key: string] : Migration } = await this.getMigrations(path_to_migrations)
            Migrate.instance = new Migrate(dataBase, path_to_migrations, migrations);
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

    startMigration(args: string[]){
        // if (this.versionExist(targetVersion)){
        //
        // } else {
        //     throw new Error('Version migrate not exist')
        // }
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
            migration_names.map(migrationName => console.log(` - ${migrationName}`));
        } else {
            console.log('Migration list is empty')
        }
    }

    versionExist(args: string[]): boolean {
        // if(this.migrations.length > 0){
        //     this.migrations.map( migrate => {
        //         if (migrate.version === targetVersion) return true
        //     })
        // }
        return false
    }
}