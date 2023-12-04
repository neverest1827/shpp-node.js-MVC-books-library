import fs from "fs/promises";
import mysql, {Connection, ResultSetHeader} from "mysql2/promise";

export class DataBase {
    private static instance: DataBase | null = null;
    connection: Connection
    path_to_sql_scripts: string
    sql_scripts: {[key: string]: string | undefined}
    constructor(connection: Connection, path_to_sql_scripts: string) {
        this.connection = connection;
        this.path_to_sql_scripts = path_to_sql_scripts;
        this.sql_scripts = {
            create_table: undefined,
        }
    }

    static async getInstance(): Promise<DataBase> {
        if (!DataBase.instance) {
            const path_to_sql_scripts: string = "./sql/";
            const path_to_config: string = "../config.json";
            const config: string = await fs.readFile(path_to_config, 'utf-8');
            const connection: Connection = await this.createConnection(JSON.parse(config));
            DataBase.instance = new DataBase(connection, path_to_sql_scripts);
        }
        return DataBase.instance;
    }

    static async createConnection(config: object) : Promise<Connection> {
        try {
            return await mysql.createConnection(config);
        } catch (err){
            throw new Error(`Connection failed! ${err}`)
        }
    }

    async createTable(version: string): Promise<void> {
        console.log('create table');
        // try {
        //     const sql_script: string = await this.getSqlScript(`create_table_${version.toLowerCase()}.sql`);
        //     await connection.connect()
        //     const [result] = await connection.execute<ResultSetHeader>(sql_script);
        //     return result;
        // } catch (err){
        //     throw new Error(`${err}`)
        // } finally {
        //     await connection.end()
        // }
    }

    async dropTable(version: string): Promise<void> {
        console.log('drop table');
    }

    async getSqlScript(fileName: string): Promise<string> {
        try {
            return await fs.readFile(this.path_to_sql_scripts, 'utf-8');
        } catch (err) {
            throw new Error(`${err}`);
        }
    }




}

const config: string = await fs.readFile('../config.json', 'utf-8');
const path_to_sql_scripts: string = '../sql';

let connection: Connection
try {
    connection = await mysql.createConnection(JSON.parse(config));
} catch (err){
    throw new Error(`Connection failed! ${err}`)
}

export const handler_db: DataBase = new DataBase(connection, path_to_sql_scripts);