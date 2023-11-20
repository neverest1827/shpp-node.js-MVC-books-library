import mysql, { Connection } from "mysql2/promise";
import {TypeBooks, TypeResult} from "types";
import fs from "fs/promises";

const config: string = await fs.readFile('./config.json', 'utf-8');
const default_offset: number = 20;
export async function getBooks(filter: string, offset: string | number, limit: string): Promise<TypeResult> {
    offset = offset ? +offset : default_offset;
    const connection: Connection = await mysql.createConnection(JSON.parse(config));
    try {
        await connection.connect()
        const sql_command: string = await getSqlCommand(filter)
        const [books , field] = await connection.execute(sql_command);

        return {
            success: true,
            data: {
                books: (books as TypeBooks[]).splice(0, offset),
                amount: offset
            }
        }

    } catch (err) {
        return {
            success: false,
            msg: `${err}`
        }

    } finally {
        await connection.end()
    }
}

async function getSqlCommand(filter: string): Promise<string> {
    return await fs.readFile(`./dist/sql/get_books_filter_${filter}.sql`, 'utf-8');
}