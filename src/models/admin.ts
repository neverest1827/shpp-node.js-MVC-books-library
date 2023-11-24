import mysql, {Connection} from "mysql2/promise";
import fs from "fs/promises";
import {TypeBook, TypeResult, TypeTotal} from "types";

const config: string = await fs.readFile('./config.json', 'utf-8');
const path_to_sql_scripts: string = './dist/sql';
export async function getBooksInfo(offset: string, limit: string): Promise<TypeResult>{
    const connection: Connection = await mysql.createConnection(JSON.parse(config));

    try {
        await connection.connect()
        const sql_get_total: string = await fs.readFile(`${path_to_sql_scripts}/get_total.sql`, "utf-8")
        const sql_command: string = await fs.readFile(`${path_to_sql_scripts}/get_books_for_admin_page.sql`, "utf-8")
        const [books] = await connection.execute(sql_command, [limit, offset]);
        const [result] = await connection.execute<TypeTotal>(sql_get_total);
        const total: number = +result[0].total
        return {
            success: true,
            data: {
                books: books as TypeBook[],
                offset: offset,
                total: {
                    amount: total,
                }
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