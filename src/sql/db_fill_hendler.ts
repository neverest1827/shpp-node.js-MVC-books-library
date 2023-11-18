import fs from "fs"
import mysql, {Connection} from "mysql2";
import {TypeBooks} from "types";

const data: string = fs.readFileSync('../../data.json', 'utf-8');
const config: string = fs.readFileSync('../../config.json', 'utf-8');
const books: TypeBooks[] = JSON.parse(data);
const options = JSON.parse(config)

const connection: Connection = mysql.createConnection(options)
for (const book of books) {
    connection.query(
        'INSERT INTO library (name, author, description, year, clicks, path, pages, stars) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [book.name, book.author, book.description, book.year, book.clicks, book.path, book.pages, book.stars],
        (error: mysql.QueryError | null, results, fields: mysql.FieldPacket[]) => {
            if (error) {
                throw new Error(`${error}`)
            }
        }
    );
}
console.log("success")
connection.end()
