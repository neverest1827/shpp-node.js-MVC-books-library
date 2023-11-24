import mysql, {Connection} from "mysql2/promise";
import {TypeBook, TypeResult, TypeTotal} from "types";
import fs from "fs/promises";


const config: string = await fs.readFile('./config.json', 'utf-8');
const default_offset: string = '0';
const path_to_sql_scripts: string = './dist/sql';
export async function getBooks(filter: string, limit: string, offset: string): Promise<TypeResult> {
    offset = offset ? offset : default_offset;

    const connection: Connection = await mysql.createConnection(JSON.parse(config));
    try {
        await connection.connect()
        const sql_get_total: string = await fs.readFile(`${path_to_sql_scripts}/get_total.sql`, "utf-8")
        const sql_command: string = await getSqlCommand(filter)
        const [books] = await connection.execute(sql_command, [limit, offset]);
        const [result] = await connection.execute<TypeTotal>(sql_get_total);
        const total = +result[0].total
        return {
            success: true,
            data: {
                books: books as TypeBook[],
                filter: filter,
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

async function getSqlCommand(filter: string): Promise<string> {
    return await fs.readFile(`${path_to_sql_scripts}/get_books_filter_${filter}.sql`, 'utf-8');
}

export async function search(searchText: string): Promise<TypeResult> {
    searchText = `%${searchText}%`;
    const connection: Connection = await mysql.createConnection(JSON.parse(config));
    try {
        await connection.connect()
        const sql_command: string = await fs.readFile(`${path_to_sql_scripts}/search.sql`, 'utf-8');
        const [books, fields ] = await connection.execute(sql_command, [searchText, searchText, searchText]);
        const total: number = (books as TypeBook[]).length
        return {
            success: true,
            data: {
                books: books as TypeBook[],
                total: {
                    amount: total,
                }
            }
        }
    } catch (err) {
        console.log(err)
        return {
            success: false,
            msg: `${err}`
        }

    } finally {
        await connection.end()
    }
}

export async function getBook(id: string): Promise<TypeResult> {
    const connection: Connection = await mysql.createConnection(JSON.parse(config));
    try {
        await connection.connect()
        const sql_command: string = await fs.readFile(`${path_to_sql_scripts}/get_book_by_id.sql`, "utf-8");
        const [books, fields ] = await connection.execute(sql_command, [id]);
        const book = (books as TypeBook[])[0]
        return {
            success: true,
            data: book
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

export async function updateBookStatistics(id: string): Promise<TypeResult>{
    const connection: Connection = await mysql.createConnection(JSON.parse(config));
    try {
        await connection.connect()
        const sql_command: string = await fs.readFile(`${path_to_sql_scripts}/update_book_statistics_by_id.sql`, "utf-8");
        const sql_get_statistics: string = await fs.readFile(`${path_to_sql_scripts}/get_book_statistics_by_id.sql`, "utf-8");
        await connection.execute(sql_command, [id]);
        const [result] = await connection.execute<TypeTotal>(sql_get_statistics, [id])
        const countClicks = result[0].clicks
        return {
            success: true,
            data: countClicks
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
export async function updateViewsPage(id: string): Promise<TypeResult>{
    const connection: Connection = await mysql.createConnection(JSON.parse(config));
    try {
        await connection.connect()
        const sql_command: string = await fs.readFile(`${path_to_sql_scripts}/update_book_views_by_id.sql`, "utf-8");
        await connection.execute(sql_command, [id]);
        await connection.execute<TypeTotal>(sql_command, [id])
        return {
            success: true,
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