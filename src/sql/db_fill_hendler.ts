import fs from "fs"
import mysql, {Connection} from "mysql2";
import {TypeBook} from "types";

const data: string = fs.readFileSync('../../data.json', 'utf-8');
const config: string = fs.readFileSync('../../config.json', 'utf-8');
const sql_script: string = fs.readFileSync('./fill_table.sql', "utf-8");
const books: TypeBook[] = JSON.parse(data);
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

function getRandomBoolean(): boolean{
    return Math.random() < 0.5;
}

function generateIsbn() {
    // Генерация префикса "978"
    var isbnPrefix = "978";

    // Генерация 9 случайных цифр
    var randomDigits = "";
    for (var i = 0; i < 9; i++) {
        randomDigits += Math.floor(Math.random() * 10);
    }

    // Вычисление контрольной цифры для ISBN-13
    var checksum = (isbnPrefix + randomDigits)
        .split("")
        .map(Number)
        .reduce(function (sum, digit, index) {
            return sum + (index % 2 === 0 ? digit : digit * 3);
        }, 0) % 10;

    checksum = (10 - checksum) % 10;

    // Возвращение сгенерированного ISBN-13
    return isbnPrefix + randomDigits + checksum;
}

const connection: Connection = mysql.createConnection(options)
try {
    for (const book of books) {
        connection.query(
            sql_script,
            [
                generateIsbn(),
                book.name,
                book.author,
                book.description,
                book.year,
                book.pages,
                getRandomInt(max_rating, min_rating),
                generateRandomDatetime(),
                book.clicks,
                getRandomBoolean()
            ]
        );
    }
    console.log("success")
} catch (err) {
    console.log(err)
} finally {
    connection.end();
}
