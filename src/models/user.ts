import mysql, { Connection } from "mysql2/promise";
import { TypeBooks } from "types";
import fs from "fs/promises";

const config: string = await fs.readFile('./config.json', 'utf-8');
const default_offset: number = 20;
export async function getBooks(filter: string, offset: string | number, limit: string): Promise<TypeBooks[] | null> {
    offset = offset ? offset : default_offset;
    const connection: Connection = await mysql.createConnection(JSON.parse(config));
    try {
        await connection.connect()
        const sql_command: string = await getSqlCommand(filter)
        const [result , field] = await connection.execute(sql_command);
        return result as TypeBooks[];
    } catch (err) {
        console.log(`${err}`)
        return null;
    } finally {
        await connection.end()
    }
}

async function getSqlCommand(filter: string): Promise<string> {
    return await fs.readFile(`./dist/sql/get_books_filter_${filter}.sql`, 'utf-8');
}