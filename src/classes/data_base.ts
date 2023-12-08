import fs from "fs/promises";
import mysql, {Connection, ResultSetHeader, RowDataPacket} from "mysql2/promise";
import fast_csv from "fast-csv";
import {TypeData} from "types";

export class DataBase {
    private static instance: DataBase | null = null;
    config: object
    path_to_sql_scripts: string
    sql_scripts: {[key: string]: string}
    constructor(config: object, path_to_sql_scripts: string) {
        this.config = config;
        this.path_to_sql_scripts = path_to_sql_scripts;
        this.sql_scripts = {};
    }

    static async getInstance(): Promise<DataBase> {
        if (!DataBase.instance) {
            const path_to_sql_scripts: string = "./sql/";
            const path_to_config: string = "../config.json";
            const config: string = await fs.readFile(path_to_config, 'utf-8');
            DataBase.instance = new DataBase(JSON.parse(config), path_to_sql_scripts);
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

    async execute(sqlScript: string, data?: any){
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


    async getSqlScript(fileName: string): Promise<string> {
        if (Object.keys(this.sql_scripts).includes(fileName)) return this.sql_scripts[fileName]
        try {
            const sql_script: string = await fs.readFile(this.path_to_sql_scripts + fileName, 'utf-8');
            this.sql_scripts[fileName] = sql_script;
            return sql_script;
        } catch (err) {
            console.log(err);
            throw new Error(`${err}`);
        }
    }

    async importFromCsv(tableName: string, csvData: [string | number| boolean]): Promise<void> {
        const sql_script = await this.getSqlScript('fill_table_v1.sql');
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
}