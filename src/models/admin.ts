import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import fs from "fs/promises";
import {TypeBook, TypeFormData, TypeFormImage, TypeResult, TypeResultError, TypeResultSuccess, TypeTotal} from "types";
import {DataBase} from "../classes/data_base.js";
import {Book} from "../classes/book.js";
import {Request} from "express";
import path from "path";


const path_to_images: string = './static/books-images/';

const handler_db: DataBase = await DataBase.getInstance();
const version: string | undefined = await getVersion();

export async function getBooksInfo(offset: string, limit: string): Promise<TypeResult>{
    try {
        const sql_get_books_for_admin_page: string =
            await handler_db.getSqlScript( 'get_books_for_admin_page.sql', version);
        const sql_get_total: string = await handler_db.getSqlScript('get_total.sql', version);
        const [books] =
            await handler_db.execute(sql_get_books_for_admin_page, [limit, offset]) as TypeBook[][]
        const [result] =
            await handler_db.execute(sql_get_total) as TypeTotal[][]

        return buildSuccessfulResult(books, result[0].total, offset);

    } catch (err) {
        return getTextError(err);
    }
}

export async function addNewBook(req: Request): Promise<TypeResult>{
    const data: TypeFormData = req.body;
    const formImg: TypeFormImage = <TypeFormImage>req.files;

    try {
        const isNew: boolean = await checkBook(data.book_title);
        if (isNew) {
            const book: Book = new Book(data)
            switch (version){
                case 'v1': {
                    return await insertIntoTableV1(book, formImg);
                }
                case 'v2': {
                    return await insertIntoTableV2(book, formImg);
                }
            }
        }
        return buildFailedResult('This Book exist');

    } catch (err) {
        return getTextError(err);
    }
}

async function checkBook(title: string): Promise<boolean> {
    const sql_compare_by_title: string = await handler_db.getSqlScript('compare_by_title.sql', version);
    const [result] = await handler_db.execute(sql_compare_by_title, [title]) as RowDataPacket[][];
    return result.length === 0;
}



async function saveImage(pathToImages: string, fileName: number, formImage: Express.Multer.File): Promise<void>{
    try {
        await fs.writeFile(`${pathToImages + fileName}.jpg`, formImage.buffer)
    } catch (err) {
        throw new Error(`${err}`)
    }
}


function buildSuccessfulResult(books?: TypeBook[], total?: number, offset?: string): TypeResultSuccess {
    if (!books) return {success: true}
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
}

function buildFailedResult(msg: string): TypeResultError{
    return {
        success: true,
        msg: msg
    }
}

async function insertIntoTableV1(book: Book, formImg: TypeFormImage): Promise<TypeResult>{
    try {
        const sql_insert_new_book: string = await handler_db.getSqlScript('insert_new_book.sql', version);
        const [result] =
            await handler_db.execute(sql_insert_new_book, book.getBookInfo()) as ResultSetHeader[];
        if (formImg) await saveImage(path_to_images, result.insertId, formImg.book_img[0]);
        return buildSuccessfulResult()
    } catch (err) {
        if (err instanceof Error) throw new Error(err.message);
        throw new Error('Unknown error');
    }
}

async function insertIntoTableV2(book: Book, formImg: TypeFormImage): Promise<TypeResult> {
    try {
        const sql_insert_into_books_authors_table: string =
            await handler_db.getSqlScript('insert_into_books_authors_table.sql', version);
        const sql_insert_into_books_table: string =
            await handler_db.getSqlScript('insert_into_books_table.sql', version);

        const authors: string[] = book.getAuthors().split(', ');
        const bookInfo = book.getBookInfo();
        bookInfo.splice(2, 1)

        const [result] = await handler_db.execute(
            sql_insert_into_books_table,
            bookInfo
        ) as ResultSetHeader[];

        const authors_id: number[] = await getAuthorsId(authors);
        const book_id: number = result.insertId;

        for (const author_id of authors_id){
            await handler_db.execute(
                sql_insert_into_books_authors_table,
                [book_id, author_id]
            );
        }

        if (formImg) await saveImage(path_to_images, book_id, formImg.book_img[0]);
        return buildSuccessfulResult();
    } catch (err) {
        if (err instanceof Error) throw new Error(err.message);
        throw new Error('Unknown error');
    }
}

async function getAuthorsId(authors: string[]){
    const authors_id: number[] = []

    try {
        const sql_compare_authors_name: string =
            await handler_db.getSqlScript('compare_authors_name.sql', version);
        const sql_insert_into_authors_table: string =
            await handler_db.getSqlScript('insert_into_authors_table.sql', version);

        for (const author of authors){
            const [result] =
                await handler_db.execute(sql_compare_authors_name, [author]) as RowDataPacket[][];

            if (result.length) {
                authors_id.push(result[0].author_id);
                continue;
            }

            const [headers] =
                await handler_db.execute(sql_insert_into_authors_table, [ author.trim() ]) as ResultSetHeader[];

            authors_id.push(headers.insertId);
        }

        return authors_id
    } catch (err) {
        throw new Error("Can't get authors id");
    }
}

async function getVersion(): Promise<string | undefined> {
    const migration_name: string | undefined = await handler_db.getCurrentMigration();
    if (migration_name) {
        const start: number = migration_name.lastIndexOf('-') + 1;
        return migration_name.substring(start);
    }
    return migration_name;
}

function getTextError(err: any): TypeResultError{
    if (err instanceof Error) {
        console.log(err.message);
        return buildFailedResult(err.message);
    }
    return buildFailedResult('Unknown error');
}

export async function deleteBook(id: string): Promise<TypeResult> {
    try {
        await fs.unlink(path.join(path_to_images, id));
        const sql_update_delete_time = await handler_db.getSqlScript('update_delete_time.sql', version);
        const [headers] = await handler_db.execute(sql_update_delete_time, [id]);
        return buildSuccessfulResult()
    } catch (err){
        return  buildFailedResult('Err')
    }
}
