import {buildFailedResult, buildSuccessfulResult, getTextError, getTotalRowsCount} from "../functions.js";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import {SecurityManager} from "../classes/security_manager.js";
import {APP_PATHS, AppError} from "../configs/app_config.js";
import {HandlerDB} from "../classes/handler_db.js";
import {Migrate} from "../classes/migrate.js";
import {Book} from "../classes/book.js";
import fs from "fs/promises";
import path from "path";

const handler_db: HandlerDB = await HandlerDB.getInstance();
const security_manager: SecurityManager = SecurityManager.getInstance();
const version: string | undefined = await Migrate.getCurrentMigrationVersion()

/**
 * Retrieves information about books based on the provided query parameters for admin page.
 *
 * @param query - An object containing limit and offset for pagination.
 */
export async function getBooksInfo(query: QueryFilter): Promise<Result>{
    try {
        const {limit, offset} = query;
        const totalRowsCount: number = await getTotalRowsCount(version);

        const isValidOffset: boolean = security_manager.checkOutOfRange(offset, totalRowsCount);
        const isValidLimit: boolean = security_manager.checkOutOfRange(limit, totalRowsCount);

        if (isValidOffset && isValidLimit) {
            const sql_get_books_for_admin_page: string = await handler_db.getSqlScript(
                'get_books_for_admin_page.sql',
                version
            );
            let [books] = await handler_db.execute(
                sql_get_books_for_admin_page,
                [limit, offset]
            ) as TBook[][];

            books = security_manager.shieldData(books);
            return buildSuccessfulResult(books, totalRowsCount, offset);
        }
        return buildFailedResult(AppError.BAD_REQUEST);

    } catch (err) {
        console.error(`Error receiving book data: ${err}`);
        throw new Error( getTextError(err) );

    } finally {
        await handler_db.closeConnection();
    }
}

/**
 * Adds a new book to the database based on the provided form image and form data.
 *
 * @param formImg - An object containing image data for the book cover.
 * @param formData - An object containing data for the new book.
 */
export async function addNewBook(formImg: FormImage, formData: TFormData): Promise<Result>{
    try {
        const isNew: boolean = await checkBook(formData.book_title);
        if (isNew) {
            let book_id: number = 0;
            const newBook: Book = new Book(formData)
            const bookInfo: (string | number | boolean | null)[] = newBook.getBookInfo()

            switch (version){
                case 'v1': {
                    book_id = await insertIntoBookTable(bookInfo);
                    break;
                }
                case 'v2': {
                    bookInfo.splice(2, 1) // Remove authors
                    book_id = await insertIntoBookTable(bookInfo);
                    const authors_id = await insertIntoAuthorsTable(newBook);
                    await insertIntoBooksAuthorsTable(authors_id, book_id);
                    break;
                }
            }

            if (formImg && book_id) {
                await saveImage(book_id, formImg.book_img[0]);
            }
            return buildSuccessfulResult()
        }
        return buildFailedResult('Book already exist');

    } catch (err) {
        console.error(`Error adding a new book: ${err}`);
        throw new Error( getTextError(err) );
    }
}

/**
 * Checks whether a book with the given title already exists in the database.
 *
 * @param bookTitle - The title of the book to check.
 */
async function checkBook(bookTitle: string): Promise<boolean> {
    const sql_compare_by_title: string = await handler_db.getSqlScript('compare_by_title.sql', version);

    const [result] = await handler_db.execute(
        sql_compare_by_title,
        [bookTitle]
    ) as RowDataPacket[][];

    return result.length === 0;
}

/**
 * Inserts a new book into the books table and returns the insert ID.
 *
 * @param bookInfo - An array containing information about the new book.
 */
async function insertIntoBookTable(bookInfo: (string | number | boolean | null)[]): Promise<number> {
    try {
        const sql_insert_new_book: string = await handler_db.getSqlScript(
            'insert_into_books_table.sql',
            version
        );

        const [result] = await handler_db.execute(
            sql_insert_new_book,
            bookInfo,
        ) as ResultSetHeader[];

        return result.insertId;
    } catch (err) {
        console.error(`Error writing to the books table: ${err}`)
        throw new Error( getTextError(err) );
    }
}

/**
 * Inserts authors into the authors table and returns an array of author IDs.
 * If an author already exists in the table, their existing ID is used.
 *
 * @param book - the instance the book.
 */
async function insertIntoAuthorsTable(book: Book): Promise<number[]> {
    const authors: string[] = book.getAuthors().split(', ');
    const authors_id: number[] = [];

    try {
        const sql_compare_authors_name: string = await handler_db.getSqlScript(
            'compare_authors_name.sql',
            version
        );
        const sql_insert_into_authors_table: string = await handler_db.getSqlScript(
            'insert_into_authors_table.sql',
            version
        );

        for (const author of authors){
            const [result] = await handler_db.execute(
                sql_compare_authors_name,
                [author]
            ) as RowDataPacket[][];

            if (result.length) {
                authors_id.push(result[0].author_id);
                continue;
            }

            const [headers] = await handler_db.execute(
                sql_insert_into_authors_table,
                [ author.trim() ]
            ) as ResultSetHeader[];

            authors_id.push(headers.insertId);
        }

        return authors_id
    } catch (err) {
        console.error(`Error writing to the authors table: ${err}`)
        throw new Error( getTextError(err) );
    }
}

/**
 * Inserts entries into the books_authors table to establish relationships
 * between authors and a specific book.
 *
 * @param authorsId - An array of author IDs to associate with the book.
 * @param bookId - The ID of the book to associate with the authors.
 */
async function insertIntoBooksAuthorsTable(authorsId: number[], bookId: number){
    try {
        const sql_insert_into_books_authors_table: string = await handler_db.getSqlScript(
            'insert_into_books_authors_table.sql',
            version
        );

        for (const author_id of authorsId){
            await handler_db.execute(
                sql_insert_into_books_authors_table,
                [bookId, author_id]
            );
        }

    } catch (err) {
        console.error(`Error writing to the books_authors table: ${err}`)
        throw new Error( getTextError(err) );
    }
}

/**
 * Saves an image file with the specified file name and content to the designated directory.
 *
 * @param fileName - The name to be given to the saved image file.
 * @param formImage - An Express.Multer.File object representing the image file.
 */
async function saveImage(fileName: number, formImage: Express.Multer.File): Promise<void>{
    try {
        await fs.writeFile(path.join(APP_PATHS.PATH_TO_IMAGES, `${fileName}.jpg`), formImage.buffer);
    } catch (err) {
        console.error(`Error creating an image: ${err}`);
        throw new Error( getTextError(err) );
    }
}

/**
 * Deletes a book by updating its delete time in the database.
 *
 * @param id - The ID of the book to be deleted.
 */
export async function deleteBook(id: string): Promise<Result> {
    try {
        const sql_update_delete_time: string = await handler_db.getSqlScript('update_delete_time.sql', version);
        await handler_db.execute(sql_update_delete_time, [id]);
        return buildSuccessfulResult();
    } catch (err){
        console.error(`Error deleting book: ${err}`);
        return  buildFailedResult( getTextError(err) );
    }
}
