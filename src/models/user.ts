import {TypeBooks} from "types";
import { connection } from "./database.js";
import fs from "fs/promises";

const default_offset: number = 20;
export async function getBooks(offset: number | undefined = default_offset, filter?: string): Promise<TypeBooks[] | null> {
    try {
        await connection.connect()
        const sql_command: string = await fs.readFile('./dist/sql/getBooks.sql', 'utf-8');
        const data = await connection.execute(sql_command);
        return data[0] as TypeBooks[];
    } catch (err) {
        console.log(`${err}`)
        return null;
    } finally {
        await connection.end()
    }
}