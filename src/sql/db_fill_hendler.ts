import fs from "fs"
import mysql, {Connection} from "mysql2";
import {TypeBooks} from "types";

const data: string = fs.readFileSync('../../data.json', 'utf-8');
const config: string = fs.readFileSync('../../config.json', 'utf-8');
const sql_script: string = fs.readFileSync('./fill_table.sql', "utf-8");
const books: TypeBooks[] = JSON.parse(data);
const options = JSON.parse(config)
const max_rating: number = 5;
const min_rating: number = 1;

function generateRandomDatetime(): string {
    const randomDate: Date = new Date(Math.floor(Math.random() * Date.now()));
    return randomDate.toISOString().slice(0, 19).replace("T", " ");
}

function getRandomInt(max: number, min: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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
                getRandomInt(max_rating, min_rating),
                generateRandomDatetime(),
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
