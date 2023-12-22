import {RowDataPacket} from "mysql2/promise";
import fs from "fs/promises";

// Crutch to avoid getting a wrong path error Т_Т
const path_to_class: string = "../classes/handler_db.js" || "./handler_db.js"
const { HandlerDB } = await import(path_to_class);
export default {

    async up(): Promise<void>{
        const version: string = 'v1';
        const handler_db = await HandlerDB.getInstance();

        try {
            const sql_script: string = await handler_db.getSqlScript('create_table.sql', version);
            const sql_insert_new_book: string = await handler_db.getSqlScript('insert_into_books_table.sql', version);
            await handler_db.execute(sql_script);

            const path_to_start_data = handler_db.getPathToStartData();
            const startData: string = await fs.readFile(path_to_start_data, "utf-8");
            const books: TBook[] = await handler_db.parseCsv(startData)

            for(const book of books){
                const date: string = book.date ? book.date : new Date(Date.now()).toDateString();
                await handler_db.execute(sql_insert_new_book, [
                    book.isbn ? book.isbn : null,
                    book.title,
                    book.author,
                    book.description,
                    book.year,
                    book.pages ? book.pages : null,
                    book.stars ? book.stars : null,
                    date.substring(0, 19).replace('T', ' '),
                    book.clicks ? book.clicks : null,
                    book.views ? book.views : null,
                    book.event,
                    book.delete_time ? book.delete_time : null
                ]);
            }
        } catch (err) {
            throw new Error(`${err}`);
        } finally {
            await handler_db.closeConnection();
        }
    },

    async down(): Promise<void>{
        const handler_db = await HandlerDB.getInstance();

        try {
            const sql_drop_table: string = await handler_db.getSqlScript('drop_table.sql');
            const sql_get_all_info_from_table: string = await handler_db.getSqlScript(
                'get_all_info_from_table.sql'
            );

            const [books] = await handler_db.execute(
                sql_get_all_info_from_table.replace(/{tableName}/, 'library')
            ) as RowDataPacket[][];

            await handler_db.createCsvData(books as TBook[])
            await handler_db.execute(sql_drop_table.replace(/{tableName}/, 'library'));
        } catch (err){
            throw new Error(`${err}`);
        } finally {
            await handler_db.closeConnection();
        }
    }
}