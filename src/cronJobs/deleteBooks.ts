import {ResultSetHeader, RowDataPacket} from "mysql2/promise";
import {HandlerDB} from "../classes/handler_db.js";
import {APP_PATHS} from "../configs/app_config.js";
import {Migrate} from "../classes/migrate.js";
import {getTextError} from "../functions.js";
import fs from "fs/promises";
import path from "path";

const handler_db: HandlerDB = await HandlerDB.getInstance();
const version: string | undefined = await Migrate.getCurrentMigrationVersion();

/**
 * Deletes books from the database based on the current version.
 */
export async function deleteBooks(): Promise<void> {
    const delete_list: TBook[] = await getBooksForDeletion();

    if (delete_list.length) {
        switch (version) {
            case 'v1': {
                await deleteBooksV1(delete_list, version);
                return;
            }
            case 'v2': {
                await deleteBooksV2(delete_list, version);
                break;
            }
            default: {
                console.log('Incorrect database version');
            }
        }
    } else {
        console.log("There are no books to be deleted");
    }
}

/**
 * Retrieves a list of books eligible for deletion based on the current version.
 */
async function getBooksForDeletion(): Promise<TBook[]> {
    try {
        const sql_check_deleted_books: string =
            await handler_db.getSqlScript('find_deleted_books.sql', version);

        const [books] = await handler_db.execute(sql_check_deleted_books) as TBook[][]

        if (books.length){
            return books as TBook[]
        }
        return []
    } catch (err) {
        console.error( getTextError(err) );
        return []
    }
}

/**
 * Deletes books from the database and associated images for version 1.
 *
 * @param deletedBooks - An array of books to be deleted.
 * @param version - The database version.
 */
async function deleteBooksV1(deletedBooks: TBook[], version: string): Promise<void> {
    try {
        const sql_delete_book: string = await handler_db.getSqlScript('delete_book.sql', version);
        for (const book of deletedBooks) {
            await handler_db.execute(sql_delete_book, [book.id]);
            await deleteImage(book.id);
        }
        console.log(`Has been deleted ${deletedBooks.length} book(s)`);

    } catch (err) {
        if (err instanceof Error) {
            console.log(err.message)
        }
        console.log('Unknown error')
    }
}

/**
 * Deletes books and associated authors from the database for version 2.
 *
 * @param deletedBooks - An array of books to be deleted.
 * @param version - The database version.
 */
async function deleteBooksV2(deletedBooks: TBook[], version: string): Promise<void> {
    let booksCount: number = 0;
    let authorsCount: number = 0;

    try {
        const sql_find_relation_author_with_books: string =
            await handler_db.getSqlScript('find_relation_author_with_books.sql', version);
        const sql_delete_relation_authors: string =
            await handler_db.getSqlScript('delete_relation_authors.sql', version);
        const sql_delete_author: string =
            await handler_db.getSqlScript('delete_author.sql', version);
        const sql_delete_relation_books: string =
            await handler_db.getSqlScript('delete_relation_books.sql', version);
        const sql_find_authors_deleted_book: string =
            await handler_db.getSqlScript('find_authors_deleted_book.sql', version);
        const sql_delete_book: string =
            await handler_db.getSqlScript('delete_book.sql', version);

        for (const book of deletedBooks){
            const bookId: string = String(book.id);
            const [authors] =
                await handler_db.execute(sql_find_authors_deleted_book, [bookId]) as RowDataPacket[][];

            authorsCount += await deleteAuthorsAndAuthorsRelation(
                authors,
                sql_find_relation_author_with_books,
                sql_delete_relation_authors,
                sql_delete_author
            );

            await handler_db.execute(sql_delete_relation_books, [bookId]);
            const [headers] = await handler_db.execute(sql_delete_book, [bookId]) as ResultSetHeader[];
            booksCount += headers.affectedRows;

            await deleteImage(book.id);
        }

        console.log(`Has been deleted ${booksCount} book(s) and ${authorsCount} author(s)`);
    } catch (err) {
        console.error(`Error deleting books from the database, version 2: ${err}`)
    }
}

/**
 * Deletes authors and their relationships based on the given SQL scripts.
 *
 * @param authors - An array of authors to be deleted.
 * @param sqlFindRelationAuthorWithBooks - SQL script to find relationships of an author with books.
 * @param sqlDeleteRelationAuthors - SQL script to delete relationships of an author with books.
 * @param sqlDeleteAuthor - SQL script to delete an author.
 */
async function deleteAuthorsAndAuthorsRelation(
    authors: RowDataPacket[],
    sqlFindRelationAuthorWithBooks: string,
    sqlDeleteRelationAuthors: string,
    sqlDeleteAuthor: string
): Promise<number> {

    let authorsCount: number = 0;
    for (const author of authors){
        try {
            const [relation] =
                await handler_db.execute(sqlFindRelationAuthorWithBooks, [author.id]) as RowDataPacket[][];

            if (relation[0].count < 2) {
                await handler_db.execute(sqlDeleteRelationAuthors, [author.id]);

                const [headers] = await handler_db.execute(
                    sqlDeleteAuthor,
                    [author.id]
                ) as ResultSetHeader[];

                authorsCount += headers.affectedRows;
            }

        } catch (err) {
            throw new Error( getTextError(err) );
        }

    }
    return authorsCount
}

/**
 * Deletes an image file associated with the given name from the specified path.
 *
 * @param nameImg - The name or identifier of the image file to be deleted.
 */
async function deleteImage(nameImg: number): Promise<void> {
    const path_to_img_file: string = path.join(APP_PATHS.PATH_TO_IMAGES, `${nameImg}`);
    try {
        await fs.access(path_to_img_file);
        await fs.unlink(path_to_img_file);
    } catch (err){
        console.log(`Image deletion error: ${err}`);
    }
}
