import fs from "fs/promises";
import mysql, {Connection, RowDataPacket} from "mysql2/promise";
import fast_csv from "fast-csv";
import {TypeData} from "types";
import path from "path";
import { fileURLToPath } from 'url';

export class DataBase {
    private static instance: DataBase | null = null;
    config: object
    path_to_work_dir: string
    path_to_sql_scripts: string
    sql_scripts: {[key: string]: string}

    constructor(config: object, path_to_work_dir: string) {
        this.config = config;
        this.path_to_work_dir = path_to_work_dir;
        this.path_to_sql_scripts = path_to_work_dir + 'dist/sql/';
        this.sql_scripts = {};
    }

    static async getInstance(): Promise<DataBase> {
        if (!DataBase.instance) {
            const path_to_file: string = path.dirname(fileURLToPath(import.meta.url));
            const path_to_work_dir: string = path_to_file.substring(0, path_to_file.indexOf('dist'));
            const config: string = await fs.readFile(path_to_work_dir + 'config.json', 'utf-8');
            DataBase.instance = new DataBase(JSON.parse(config), path_to_work_dir);
        }
        return DataBase.instance;
    }

    async createConnection() : Promise<Connection> {
        try {
            return await mysql.createConnection(this.config);
        } catch (err){
            throw new Error(`Connection failed! ${err}`)
        }
    }

    async execute(sqlScript: string, data?: any[]){
        const connection: Connection = await this.createConnection()
        try {
            if (data && data.length) return await connection.execute(sqlScript, data);
            return await connection.execute(sqlScript);
        } catch (err) {
            console.log(err);
            throw new Error(`${err}`);
        } finally {
            await connection.end();
        }
    }


    async getSqlScript(fileName: string, versionFolder?: string | undefined): Promise<string> {
        if (Object.keys(this.sql_scripts).includes(fileName)) return this.sql_scripts[fileName]
        versionFolder = versionFolder ? versionFolder : '';
        try {
            const sql_script: string =
                await fs.readFile(`${this.path_to_sql_scripts + versionFolder}/${fileName}`, 'utf-8');
            this.sql_scripts[fileName] = sql_script;
            return sql_script;
        } catch (err) {
            throw new Error(`${err}`);
        }
    }

    async importFromCsv(tableName: string, csvData: [string | number| boolean]): Promise<void> {
        const sql_script = await this.getSqlScript('insert_new_book.sql', 'v1');
        await this.execute(sql_script, csvData);
    }

    async parseCsv(): Promise<TypeData[]> {
        try {
            const data: string = await fs.readFile('data.csv', "utf-8");

            return await new Promise((resolve, reject) => {
                const parsedData: TypeData[] = [];
                fast_csv
                    .parseString(data, { headers: true })
                    .on('data', (row) => {
                        parsedData.push(row);
                    })
                    .on('end', () => {
                        resolve(parsedData);
                    })
                    .on('error', (error) => {
                        reject(error);
                    });
            });

        } catch (err){
            throw new Error(`${err}`);
        }
    }

    async exportToCsv(tableName: string): Promise<void>{
        const connection: Connection = await this.createConnection()
        try {
            const [result] = await connection.execute<RowDataPacket[]>(`SELECT * FROM ${tableName}`);
            const jsonData = JSON.parse(JSON.stringify(result));
            await fs.writeFile('data.csv', fast_csv.write(jsonData, {headers: true}))
        } catch (err){
            throw new Error(`${err}`);
        } finally {
            await connection.end();
        }
    }

    async getCurrentMigration(): Promise<string | undefined> {
        try {
            const data: string =
                await fs.readFile(this.path_to_work_dir + 'dist/migrate_log.json', 'utf-8');
            const migration = JSON.parse(data);
            return migration.name;
        } catch (err) {
            return undefined;
        }
    }
}