import {TypeData} from "types";

const path_to_class: string = "../classes/data_base.js" || "./data_base.js"
const { DataBase } = await import(path_to_class);
// import {DataBase} from "../classes/data_base";
export default {

    async up(): Promise<void>{
        try {
            const handlerDb = await DataBase.getInstance();
            const sql_script: string = await handlerDb.getSqlScript('create_table_v1.sql');
            const sql_fill_script = await handlerDb.getSqlScript('fill_table_v1.sql');
            await handlerDb.execute(sql_script);

            const books = await handlerDb.parseCsv()

            for(const key of Object.keys(books)){
                const book = books[key];
                const date = book.date ? book.date : new Date(Date.now()).toDateString();
                await handlerDb.execute(sql_fill_script, [
                    book.isbn ? book.isbn : null,
                    book.title,
                    book.author,
                    book.description,
                    book.year,
                    book.pages ? book.pages : null,
                    book.stars ? book.stars : null,
                    date.slice(0, 19).replace("T", " "),
                    book.clicks ? book.clicks : null,
                    book.views ? book.views : null,
                    !!book.event,
                    book.delete_time ? book.delete_time : null
                ]);
            }
        } catch (err) {
            throw new Error(`${err}`);
        }
    },

    async down(): Promise<void>{
        try {
            const handlerDb = await DataBase.getInstance();
            const sql_script: string = await handlerDb.getSqlScript('drop_table_v1.sql');
            await handlerDb.exportToCsv('library');
            await handlerDb.execute(sql_script);
        } catch (err){
            throw new Error(`${err}`);
        }
    }
}