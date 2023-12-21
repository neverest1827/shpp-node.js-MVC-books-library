import mysql, {Connection} from "mysql2/promise";
import {HANDLER_DB_PATHS} from "../configs/handler_db_config.js";
import {getTextError} from "../functions.js";
import mysqldump from "mysqldump";
import fast_csv from "fast-csv";
import fs from "fs/promises";
import path from "path";

/**
 * A class that facilitates interaction with the MySql database. This class implements common methods that can be used
 * to reduce the amount of code and improve readability
 */
export class HandlerDB {
    private static instance: HandlerDB | null = null;
    private readonly _path_to_sql_scripts: string;
    private readonly _path_to_start_data: string;
    private readonly _path_to_backups: string;
    private readonly _sql_script_cache: SqlScriptCache;
    private _connection: Connection | undefined;
    private readonly _config: Config;

    constructor(config: Config) {
        this._path_to_sql_scripts = HANDLER_DB_PATHS.PATH_TO_SQL_SCRIPTS;
        this._path_to_backups = HANDLER_DB_PATHS.PATH_TO_BACKUP_FOLDER;
        this._path_to_start_data = HANDLER_DB_PATHS.PATH_TO_START_DATA;
        this._config = config;
        this._sql_script_cache = {};
    }

    static async getInstance(): Promise<HandlerDB> {
        if (!HandlerDB.instance) {
            const config: string = await fs.readFile(HANDLER_DB_PATHS.PATH_TO_CONFIG, 'utf-8');
            HandlerDB.instance = new HandlerDB( JSON.parse(config) );
        }
        return HandlerDB.instance;
    }

    async createConnection(): Promise<Connection> {
        if (!this._connection) this._connection = await mysql.createConnection(this._config);
        return this._connection;
    }

    async closeConnection(): Promise<void> {
        await this._connection?.end();
        this._connection = undefined;
    }

    /**
     * Executes a SQL script on the database using an active connection.
     *
     * @param sqlScript - SQL script to execute
     * @param data - An optional array of parameters used in the SQL script. Can contain both strings and numbers.
     */
    async execute(sqlScript: string, data?: (string | number | boolean | null)[]): Promise<DbResult> {
        try {
            const connection: Connection = await this.createConnection();
            if (data && data.length) return connection.execute(sqlScript, data);
            return connection.execute(sqlScript);
        } catch (err) {
            console.error(`Error executing SQL script: ${err}`);
            throw new Error( getTextError(err) );
        }
    }

    /**
     * Gets the SQL script from the file of the specified name and version folder (if specified).
     * Uses the cache to avoid reading the same script repeatedly.
     *
     * @param fileName - File name of the SQL script
     * @param versionFolder - Optional version folder for file path
     */
    async getSqlScript(fileName: string, versionFolder?: string | undefined): Promise<string> {
        const cache_key: string = this.createSqlScriptCacheKey(fileName, versionFolder);
        if ( this.isSqlScriptHasBeenRead(cache_key) ) return this._sql_script_cache[cache_key];

        versionFolder = versionFolder ? versionFolder : '';
        const path_to_file: string = path.join(this._path_to_sql_scripts, versionFolder, fileName);

        try {
            const sql_script: string = await fs.readFile(path_to_file, 'utf-8');
            this._sql_script_cache[cache_key] = sql_script;
            return sql_script;

        } catch (err) {
            console.error(`Error reading SQL script: ${err}`);
            throw new Error( getTextError(err) );
        }
    }

    /**
     * Checks if the SQL script with the specified key has already been read.
     *
     * @param cache_key - The key for caching the SQL script.
     */
    isSqlScriptHasBeenRead(cache_key: string): boolean {
        return Object.keys(this._sql_script_cache).includes(cache_key);
    }

    /**
     * Creates a unique key for caching the SQL script based on the file name and version folder (if specified)
     *
     * @param fileName - The file name of the SQL script
     * @param version - Optional version sql script
     */
    createSqlScriptCacheKey(fileName: string, version?: string | undefined): string {
        fileName = fileName.split('.')[0];
        // To avoid overwriting staples that have the same name but different content
        if (version) return `${fileName}_${version}`;
        return fileName;
    }

    /**
     * Asynchronously parses CSV data and returns an array of objects of type TBook.
     * Uses the 'fast-csv' library for CSV parsing.
     *
     * @param data - A string representing the CSV data to be parsed
     */
    async parseCsv(data: string): Promise<TBook[]> {
        try {
            return await new Promise((resolve, reject) => {
                const parsed_data: TBook[] = [];
                fast_csv
                    .parseString(data, {headers: true})
                    .on('data', (row) => {
                        parsed_data.push(row);
                    })
                    .on('end', () => {
                        resolve(parsed_data);
                    })
                    .on('error', (error) => {
                        reject(error);
                    });
            });

        } catch (err) {
            console.error(`Error parsing CSV file: ${err}`);
            throw new Error( getTextError(err) );
        }
    }

    /**
     * Asynchronously creates CSV data from TBook objects and writes it to a file.
     * Uses the 'fast-csv' library to create CSV
     *
     * @param books - Array of objects of type TBook to convert to CSV data
     */
    async createCsvData(books: TBook[]): Promise<void> {
        try {
            const json_data = JSON.parse(JSON.stringify(books));
            await fs.writeFile(this._path_to_start_data, fast_csv.write(json_data, {headers: true}));
        } catch (err) {
            console.error(`Error creating CSV file: ${err}`);
            throw new Error( getTextError(err) );
        }
    }

    /**
     * Asynchronously creates a backup copy of the database and saves it in the specified directory.
     * Uses the 'mysqldump' library to perform the backup.
     */
    async createBackup(): Promise<void> {
        try {
            const path_to_dir: string = this._path_to_backups;
            const path_to_file: string = path.join(path_to_dir, `${Date.now()}_dump.sql`);

            // Create the appropriate directories if they are missing
            await fs.mkdir(path_to_dir, {recursive: true});

            await mysqldump({
                connection: this._config,
                dumpToFile: path_to_file
            });
        } catch (err) {
            console.error(`Error creating a backup file: ${err}`)
            throw new Error( getTextError(err) );
        }
    }

    getPathToStartData(): string {
        return this._path_to_start_data;
    }
}