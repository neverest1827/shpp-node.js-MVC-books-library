import mysql, {Connection, FieldPacket, ResultSetHeader, RowDataPacket} from "mysql2/promise";
import fs from "fs/promises";
import {TypeBook, TypeData, TypeFormData, TypeFormImage, TypeResult, TypeTotal} from "types";
import {Request} from "express";

const config: string = await fs.readFile('./config.json', 'utf-8');
const path_to_sql_scripts: string = './dist/sql';
const path_to_images: string = './static/books-images/';
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


export async function addNewBook(req: Request){
    const data: TypeFormData = req.body;
    const formImg: TypeFormImage = <TypeFormImage>req.files;
    const connection: Connection = await mysql.createConnection(JSON.parse(config));
    try {
        const isNew: boolean = await checkBook(connection, data.book_title);

        if (isNew){
            const book: Book = new Book(data)
            const insert_new_book: string = await fs.readFile(`${path_to_sql_scripts}/fill_table.sql`, "utf-8");
            const [result]: [ResultSetHeader, FieldPacket[]] =  await connection.execute<ResultSetHeader>(insert_new_book, book.getBookInfo())
            if (formImg) await saveImage(path_to_images, result.insertId, formImg.book_img[0])
            return {
                success: true,
                data: result
            }
        } else {
            return {
                success: false,
                msg: "This Book exist"
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

async function checkBook(connection: Connection, title: string): Promise<boolean> {
    try {
        const compare_by_title: string = await fs.readFile(
            `${path_to_sql_scripts}/compare_by_title.sql`,
            'utf-8'
        );
        const [result] = await connection.execute<RowDataPacket[]>(compare_by_title, [title]);
        return result.length === 0;
    } catch (err){
        return false;
    }
}

class Book {
    isnb: string;
    title: string;
    author1: string;
    author2: string;
    author3: string;
    description: string;
    year: number;
    pages: number;
    stars: number;
    date: string;
    clicks: number;
    views: number;
    event: boolean;

    constructor(data: TypeData) {
        this.isnb = data.book_isbn || null;
        this.title = data.book_title;
        this.author1 = data.book_author1;
        this.author2 = data.book_author2 || null;
        this.author3 = data.book_author3 || null;
        this.description = data.book_description;
        this.year = data.book_year;
        this.pages = data.book_pages || null;
        this.stars = data.book_pages || null;
        this.date = new Date(Date.now()).toISOString().slice(0, 19).replace("T", " ");
        this.clicks = 0;
        this.views = 0;
        this.event = false;
    }

    getBookInfo(): (string | number | null | boolean)[] {
        return [
            this.isnb,
            this.title,
            this.author1,
            this.description,
            this.year,
            this.pages,
            this.stars,
            this.date,
            this.clicks,
            this.views,
            this.event
        ]
    }
}

async function saveImage(pathToImage: string, fileName: number, formImage: Express.Multer.File){
    try {
        await fs.writeFile(`${pathToImage + fileName}.jpg`, formImage.buffer)
    } catch (err) {
        throw new Error(`${err}`)
    }
}
