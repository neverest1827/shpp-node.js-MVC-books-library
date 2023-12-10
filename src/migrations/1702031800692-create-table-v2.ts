import {ResultSetHeader, RowDataPacket} from "mysql2/promise";
import {logout} from "../controllers/admin_controller";

const path_to_class: string = "../classes/data_base.js" || "./data_base.js"
const { DataBase } = await import(path_to_class);
// import {DataBase} from "../classes/data_base";

export default {
    async up(){
        const handler_db = await DataBase.getInstance();
        const tableNames: string[] = ['authors', 'books', 'books_authors'];

        for (const tableName of tableNames){
            const sql_script: string = await handler_db.getSqlScript(`create_${tableName}_table.sql`);
            await handler_db.execute(sql_script);
        }

        const sql_script_get_all_info: string =
            await handler_db.getSqlScript('get_all_info_from_table.sql');
        const sql_script_compare_authors_name: string =
            await handler_db.getSqlScript('compare_authors_name.sql');
        const sql_script_insert_into_authors_table: string =
            await handler_db.getSqlScript('insert_into_authors_table.sql');
        const sql_script_insert_into_books_authors_table: string =
            await handler_db.getSqlScript('insert_into_books_authors_table.sql');
        const sql_script_insert_into_books_table: string =
            await handler_db.getSqlScript('insert_into_books_table.sql');


        const [books] = await handler_db.execute(
            sql_script_get_all_info.replace(/{tableName}/, 'library')
        ) as RowDataPacket[][];

        for (const book of books) {

            let book_id;
            const authors_id: number[] = [];

            for (const tableName of tableNames){

                switch (tableName) {

                    case 'authors': {
                        const authorInfo: string = book.author;
                        const authors: string[] = authorInfo.split(',');

                        for (const author of authors){
                            const [result] = await handler_db.execute(
                                sql_script_compare_authors_name,
                                [author]
                            ) as RowDataPacket[][];

                            if (result.length) {
                                authors_id.push(result[0].author_id);
                                continue;
                            }

                            const [headers] = await handler_db.execute(
                                sql_script_insert_into_authors_table,
                                [ author.trim() ]
                            ) as ResultSetHeader[];

                            authors_id.push(headers.insertId);
                        }
                        break
                    }

                    case 'books': {
                        const [headers] = await handler_db.execute(
                            sql_script_insert_into_books_table,
                            [
                                book.isbn,
                                book.title,
                                book.description,
                                book.year,
                                book.pages,
                                book.stars,
                                book.date,
                                book.clicks,
                                book.views,
                                book.event,
                                book.delete_time
                            ]
                        ) as ResultSetHeader[];

                        book_id = headers.insertId;
                        break
                    }

                    case 'books_authors': {
                        for (const author_id of authors_id){
                            await handler_db.execute(
                                sql_script_insert_into_books_authors_table,
                                [book_id, author_id]
                            );
                        }
                    }
                }
            }
        }

        const sql_script_drop_table: string = await handler_db.getSqlScript('drop_table.sql');
        await handler_db.execute(sql_script_drop_table.replace(/{tableName}/, 'library'));
    },
            
    async down(){
        const handler_db = await DataBase.getInstance();
        const sql_script_table_v1: string = await handler_db.getSqlScript('create_table_v1.sql');
        await handler_db.execute(sql_script_table_v1);

        const tableNames: string[] = ['books_authors', 'authors', `books`];

        const sql_script_get_all_info_from_books_authors: string =
            await handler_db.getSqlScript('get_all_info_from_books_authors.sql');
        const sql_script_drop_table: string =
            await handler_db.getSqlScript('drop_table.sql');
        const sql_script_fill_table_v1: string =
            await handler_db.getSqlScript('fill_table_v1.sql');

        const [books] = await handler_db.execute(
            sql_script_get_all_info_from_books_authors
        ) as RowDataPacket[][]

        for (const book of books){
            await handler_db.execute(sql_script_fill_table_v1, [
                book.isbn,
                book.title,
                book.authors,
                book.description,
                book.year,
                book.pages,
                book.stars,
                book.date,
                book.clicks,
                book.views,
                book.event,
                book.delete_time
            ])
        }

        for (const tableName of tableNames){
            await handler_db.execute(sql_script_drop_table.replace(/{tableName}/, tableName));
        }
    }
}