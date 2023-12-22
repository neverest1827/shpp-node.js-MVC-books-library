import {MigrateError, Extension, Method, MIGRATE_PATHS, TARGET_DIR} from "../configs/migrate_config.js";
import {DISTRIBUTION_FOLDER} from "../configs/global_config.js";
import fs from "fs/promises";
import path from "path";

/**
 * A class that contains methods for creating and managing migration files
 */
export class Migrate {
    private static instance: Migrate | null = null;
    private readonly _path_to_migrations_folder: string;
    private readonly _path_to_log_file: string;
    private readonly _migrations: Migrations;
    private _current_migration_name: string | undefined;

    constructor(migrations: Migrations, currentMigrationName: string | undefined) {
        this._path_to_migrations_folder = MIGRATE_PATHS.PATH_TO_MIGRATIONS_FOLDER;
        this._path_to_log_file = MIGRATE_PATHS.PATH_TO_LOG_FILE;
        this._current_migration_name = currentMigrationName;
        this._migrations = migrations;
    }

    static async getInstance(): Promise<Migrate> {
        if (!Migrate.instance) {
            const migrations: Migrations = await this.getMigrations();
            const current_migration_name: string | undefined = await this.getCurrentMigrationName();
            Migrate.instance = new Migrate(migrations, current_migration_name);
        }
        return Migrate.instance;
    }

    /**
     * Reads the log file and returns the name of the migration that was performed
     *
     * @private
     */
    private static async getCurrentMigrationName(): Promise<string | undefined> {
        try {
            const file_content: string = await fs.readFile(MIGRATE_PATHS.PATH_TO_LOG_FILE, 'utf-8');
            const data = JSON.parse(file_content);
            return data.name;
        } catch (err) {
            return undefined;
        }
    }

    /**
     * Finds the current version of the migration from the current migration name
     */
    static async getCurrentMigrationVersion(): Promise<string | undefined> {
        const migrationName: string | undefined = await Migrate.getCurrentMigrationName();
        if (migrationName) return migrationName.substring(migrationName.lastIndexOf('-') + 1);
        return undefined;
    }

    /**
     * Reads migration files from the specified folder, imports them, and validates each migration object.
     * Returns an object containing valid migrations with their corresponding keys.
     *
     * @private
     */
    private static async getMigrations(): Promise<Migrations> {
        try {
            const files: string[] = await fs.readdir(MIGRATE_PATHS.PATH_TO_MIGRATIONS_FOLDER);
            const migration_files: string[] = files.filter( (file: string) => file.endsWith(Extension.JS) );

            const migrations: Migrations = {};

            for (const file of migration_files) {
                const migrations_key: string = file.split('.')[0]; // reject the expansion
                const path_to_migration_file: string = path.join(MIGRATE_PATHS.PATH_TO_MIGRATIONS_FOLDER, file);
                try {
                    const migration_object: MigrationObject = await Migrate.getMigrationObject(path_to_migration_file);
                    if ( Migrate.isValidMigrationObject(migration_object) ) {
                        migrations[migrations_key] = migration_object;
                    } else {
                        console.warn(`An invalid migration file is skipped: ${path_to_migration_file}`);
                    }
                } catch (err) {
                    console.error(`Error when importing migration file ${path_to_migration_file}: ${err}`);
                }
            }

            return migrations;

        } catch (err) {
            console.error(`Error reading migration files: ${err}`);
            return {};
        }
    }

    /**
     * Gets a migration object from a specified file using dynamic importing
     *
     * @param pathToMigrationFile - Path to migration file.
     * @private
     */
    private static async getMigrationObject(pathToMigrationFile: string): Promise<MigrationObject> {
        const fileUrl: URL = new URL(`file://${pathToMigrationFile}`);
        const {default: migrationObject} = await import(fileUrl.href);
        return migrationObject;
    }

    /**
     * Checks whether the passed migration object is valid.
     * A valid migration object must be an object containing the 'up' and 'down' functions.
     *
     * @param migrationObject - Migration object to be checked
     * @private
     */
    private static isValidMigrationObject(migrationObject: MigrationObject): boolean {
        return (
            typeof migrationObject === "object" &&
            typeof migrationObject.up === "function" &&
            typeof migrationObject.down === "function"
        );
    }

    /**
     * Creates a new migration file in the specified directory.
     *
     * @param args - An array of string arguments. The second argument is used as the migration name.
     */
    async create(args: string[]): Promise<void> {
        try {
            const migration_name: string | undefined = args[1];
            if (!migration_name) return console.error(MigrateError.NOT_VALID);

            const migration_file_name: string = this.generateMigrationFileName(migration_name);
            const path_to_file: string = path.join(this._path_to_migrations_folder, migration_file_name);

            const content: string = this.generateMigrationContent();

            await fs.writeFile(path_to_file, content);
            console.log(`The ${migration_file_name} file was created in ${this._path_to_migrations_folder}`);

        } catch (err) {
            console.error(`Error creating a file: ${err}`);
        }

    }

    /**
     * Creates a unique file name by specifying the extension
     *
     * @param migrationName - User-defined migration name
     * @private
     */
    private generateMigrationFileName(migrationName: string): string {
        const id: number = Date.now();
        const file_extension: string = TARGET_DIR === DISTRIBUTION_FOLDER ? Extension.JS : Extension.TS;
        return `${id}-${migrationName + file_extension}`;
    }

    /**
     * Returns the starting template that will be in the created migration file
     */
    generateMigrationContent(): string {
        return `
export default {
    async up(){
        /** some code */
    },
            
    async down(){
        /** some code */
    }
}`
    }

    /**
     * The method validates the specified migration name, calculates the required number of migrations to be performed,
     * and runs the corresponding method on the migration object
     *
     * @param args - Arguments passed when starting the migration.
     * The second element args (args[1]) contains the target name of the migration.
     */
    async up(args: string[]): Promise<void> {
        const target_migration_name: string | undefined = args[1];

        if ( this.isInvalidMigrationName(target_migration_name) ) return console.error(MigrateError.NOT_VALID);

        await this.performUpMigrations(target_migration_name);
        await this.setCurrentMigrationName(target_migration_name);
    }

    /**
     * The method validates the specified migration name, calculates the required number of migrations to be performed,
     * and runs the corresponding method on the migration object
     *
     * @param args Arguments passed when starting the migration.
     * The second element args (args[1]) contains the target name of the migration.
     */
    async down(args: string[]): Promise<void> {
        const target_migration_name: string | undefined = args[1];

        if (this.isInvalidMigrationName(target_migration_name)) return console.error(MigrateError.NOT_VALID);
        if (!this._current_migration_name) return console.error(MigrateError.NOT_COMPLETED);

        const migration_keys: string[] = Object.keys(this._migrations);
        const target_migration_position: number = migration_keys.indexOf(target_migration_name);

        await this.performDownMigrations(migration_keys, target_migration_position);

        const new_current_migration_name: string | undefined = migration_keys[target_migration_position - 1];
        await this.setCurrentMigrationName(new_current_migration_name);
    }

    /**
     * Checks whether the migration file name was passed and whether the specified name is in the migration array
     *
     * @param migrationName - The migration name to be checked
     * @private
     */
    private isInvalidMigrationName(migrationName: string | undefined): boolean {
        return !(migrationName && Object.keys(this._migrations).includes(migrationName));
    }

    /**
     * Performs a sequence of upward migrations to the specified target name
     *
     * @param targetMigrationName - Migration target name to which upward migration will be performed
     * @private
     */
    private async performUpMigrations(targetMigrationName: string): Promise<void> {
        const migration_keys: string[] = Object.keys(this._migrations);
        const target_migration_position: number = migration_keys.indexOf(targetMigrationName);

        if (!this._current_migration_name && target_migration_position === 0) {
            await this.startMigration(targetMigrationName, Method.UP);
        } else {
            const current_migration_position: number = migration_keys.indexOf(this._current_migration_name!);

            if (current_migration_position < target_migration_position) {
                await this.executeMigrations(
                    current_migration_position + 1, //Because the current migration has already been completed
                    target_migration_position,
                    migration_keys,
                    Method.UP
                );
            } else {
                return console.error(MigrateError.TARGET_NOT_BIGGER);
            }
        }
    }

    /**
     * Performs a sequence of downward migrations to the specified target name
     *
     * @param migrationKeys - Migration key array
     * @param targetMigrationPosition - Position of the target migration in the key array
     * @private
     */
    private async performDownMigrations(migrationKeys: string[], targetMigrationPosition: number): Promise<void> {
        const current_migration_position: number = migrationKeys.indexOf(this._current_migration_name!);

        if (current_migration_position >= targetMigrationPosition) {
            await this.executeMigrations(
                current_migration_position,
                targetMigrationPosition,
                migrationKeys,
                Method.DOWN
            );
        } else {
            console.log(MigrateError.CURRENT_NOT_BIGGER);
            return;
        }
    }

    /**
     * Executes a sequence of migrations in a specified direction
     *
     * @param startIndex - Initial position in the migration key array
     * @param endIndex - Final position in the array of migration keys
     * @param migrationKeys - Migration key array
     * @param methodName - Name of the method to be invoked in the migration object
     * @private
     */
    private async executeMigrations(
        startIndex: number, endIndex: number, migrationKeys: string[], methodName: MigrationMethods
    ): Promise<void> {

        const step: number = methodName === Method.UP ? 1 : -1;

        for (let index: number = startIndex; this.shouldContinue(index, endIndex, methodName); index += step) {
            await this.startMigration(migrationKeys[index], methodName);
        }
    }

    /**
     * Checks the condition for the continuation of the migration cycle execution
     *
     * @param index - Current position in the migration key array
     * @param endIndex - Final position in the array of migration keys
     * @param methodName - Name of the method to be invoked in the migration object
     */
    shouldContinue(index: number, endIndex: number, methodName: MigrationMethods): boolean {
        return methodName === Method.UP ? index <= endIndex : index >= endIndex
    }

    /**
     * Calls the specified method on the migration object and outputs information about its execution status to
     * the console
     *
     * @param migrationName - Name of the method to be invoked in the migration object
     * @param methodName - Name of the method to be invoked in the migration object
     */
    async startMigration(migrationName: string, methodName: MigrationMethods) {
        const start: number = migrationName.indexOf('-') + 1;
        process.stdout.write(`${methodName} ${migrationName.substring(start)}: `);
        try {
            await this._migrations[migrationName][methodName]();
            console.log('Done')
        } catch (err) {
            console.error(err);
        }
    }


    /**
     * Method for setting the current migration name and writing this name to the log
     *
     * @param newCurrentMigrationName - New name of the current migration or undefined if no migration is present
     */
    async setCurrentMigrationName(newCurrentMigrationName: string | undefined): Promise<void> {
        this._current_migration_name = newCurrentMigrationName;
        if (!newCurrentMigrationName) { // If undefined, it was the very first migration and the log should be erased
            await fs.unlink(this._path_to_log_file);
            return;
        }
        await this.createLog();
    }

    /**
     * Logs the current migration name to the log file
     * @private
     */
    private async createLog() {
        try {
            const content: object = {'name': this._current_migration_name}
            await fs.writeFile(this._path_to_log_file, JSON.stringify(content));
        } catch (err) {
            console.error(`Error creating logs ${err}`);
        }
    }

    /**
     * Method to output a list of available migrations, marking the current migration if it is defined
     */
    async ls(): Promise<void> {
        const migration_names: string[] = Object.keys(this._migrations);
        if (migration_names.length > 0) {
            console.log('Migration list:')
            migration_names.map(migrationName => {
                if (
                    typeof this._current_migration_name == 'string' &&
                    !Boolean(migrationName.localeCompare(this._current_migration_name))
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
