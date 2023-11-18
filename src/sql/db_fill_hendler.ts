import fs from "fs"
import mysql, {Connection} from "mysql2";
import {TypeBooks} from "types";

const data: string = fs.readFileSync('../../data.json', 'utf-8');
const config: string = fs.readFileSync('../../config.json', 'utf-8');
const sql_script: string = fs.readFileSync('./fill_table.sql', "utf-8");
const books: TypeBooks[] = JSON.parse(data);
const options = JSON.parse(config)

function generateRandomDatetime(): string {
    const randomDate: Date = new Date(Math.floor(Math.random() * Date.now()));
    return randomDate.toISOString().slice(0, 19).replace("T", " ");
}

const connection: Connection = mysql.createConnection(options)
try {
    for (const book of books) {
        connection.query(
            sql_script,
            [
                book.name,
                book.author,
                book.description,
                book.year,
                book.pages,
                book.stars,
                generateRandomDatetime(),
                book.path,
                book.clicks
            ]
        );
    }
    console.log("success")
} catch (err) {
    console.log(err)
} finally {
    connection.end();
}
