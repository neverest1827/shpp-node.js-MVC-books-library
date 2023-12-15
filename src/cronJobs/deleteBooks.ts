import {DataBase} from "../classes/data_base.js";
import {Migrate} from "../classes/migrate.js";
import {ResultSetHeader, RowDataPacket} from "mysql2/promise";

const handler_db: DataBase = await DataBase.getInstance();
// const current_migration_name: string | undefined = await Migrate.getCurrentMigrationName() TODO помутить с путями
const current_migration_name: string | undefined = await handler_db.getCurrentMigration();

export async function deleteBooks() {
    const deleted_books = await handler_db.getDeletedBooks()
    if (deleted_books.length && current_migration_name) {
        const version: string = current_migration_name.substring(current_migration_name.lastIndexOf('-') + 1);
        switch (version) {
            case 'v1': {
                return deleteBooksV1(deleted_books, version);
            }
            case 'v2': {
                return deleteBooksV2(deleted_books, version);
            }
            default:
        }
    } else {
        if (!current_migration_name) {
            console.log('Incorrect database version');

        } else {
            console.log("There are no books to be deleted");
        }
    }
}

async function deleteBooksV1(deleted_books: RowDataPacket[], version: string) {
    try {
        const sql_delete_book: string = await handler_db.getSqlScript('delete_book.sql', version);
        for (const book of deleted_books) {
            await handler_db.execute(sql_delete_book, [book.id]);
        }
        console.log(`Has been deleted ${deleted_books.length} book(s)`);

    } catch (err) {
        if (err instanceof Error) {
            console.log(err.message)
        }
        console.log('Unknown error')
    }
}

async function deleteBooksV2(deleted_books: RowDataPacket[], version: string) {
    let booksCount: number = 0;
    let authorsCount: number = 0;
    try {
        const sql_find_relation_author_with_books: string =
            await handler_db.getSqlScript('find_relation_author_with_books.sql', version);
        const sql_delete_relation_books: string =
            await handler_db.getSqlScript('delete_relation_books.sql', version);
        const sql_delete_relation_authors: string =
            await handler_db.getSqlScript('delete_relation_authors.sql', version);
        const sql_find_authors_deleted_book: string =
            await handler_db.getSqlScript('find_authors_deleted_book.sql', version);
        const sql_delete_author: string =
            await handler_db.getSqlScript('delete_author.sql', version);
        const sql_delete_book: string =
            await handler_db.getSqlScript('delete_book.sql', version);

        for (const book of deleted_books){
            const [authors] =
                await handler_db.execute(sql_find_authors_deleted_book, [book.id]) as RowDataPacket[][];
            for (const author of authors){
                const [relation] =
                    await handler_db.execute(sql_find_relation_author_with_books, [author.id]) as RowDataPacket[][];
                if (relation[0].count < 2) {
                    await handler_db.execute(sql_delete_relation_authors, [author.id])
                    const [headers] = await handler_db.execute(sql_delete_author, [author.id]) as ResultSetHeader[];
                    authorsCount += headers.affectedRows;
                }
            }
            await handler_db.execute(sql_delete_relation_books, [book.id]);
            const [headers] = await handler_db.execute(sql_delete_book, [book.id]) as ResultSetHeader[];
            booksCount += headers.affectedRows;
        }

        console.log(`Has been deleted ${booksCount} book(s) and ${authorsCount} author(s)`);
    } catch (err) {
        if (err instanceof Error) {
            console.log(err.message)
        }
        console.log('Unknown error')
    }
}