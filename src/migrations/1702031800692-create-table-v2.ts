import {ResultSetHeader, RowDataPacket} from "mysql2/promise";

// Crutch to avoid getting a wrong path error Т_Т
const path_to_class: string = "../classes/handler_db.js" || "./handler_db.js"
const { HandlerDB } = await import(path_to_class);

export default {
    async up(): Promise<void> {
        const version: string = 'v2'
        const handler_db = await HandlerDB.getInstance();
        const tableNames: string[] = ['authors', 'books', 'books_authors'];

        try {
            for (const tableName of tableNames){
                const sql_script: string = await handler_db.getSqlScript(`create_${tableName}_table.sql`, version);
                await handler_db.execute(sql_script);
            }

            const sql_get_all_info: string =
                await handler_db.getSqlScript('get_all_info_from_table.sql');
            const sql_compare_authors_name: string =
                await handler_db.getSqlScript('compare_authors_name.sql', version);
            const sql_insert_into_authors_table: string =
                await handler_db.getSqlScript('insert_into_authors_table.sql', version);
            const sql_insert_into_books_authors_table: string =
                await handler_db.getSqlScript('insert_into_books_authors_table.sql', version);
            const sql_insert_into_books_table: string =
                await handler_db.getSqlScript('insert_into_books_table.sql', version);


            const [books] = await handler_db.execute(
                sql_get_all_info.replace(/{tableName}/, 'library')
            ) as TBook[][];

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
                            break
                        }

                        case 'books': {
                            const [headers] = await handler_db.execute(
                                sql_insert_into_books_table,
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
                                    sql_insert_into_books_authors_table,
                                    [book_id, author_id]
                                );
                            }
                        }
                    }
                }
            }

            const sql_drop_table: string = await handler_db.getSqlScript('drop_table.sql');
            await handler_db.execute(sql_drop_table.replace(/{tableName}/, 'library'));
        } catch (err){
            throw new Error(`${err}`);
        } finally {
            await handler_db.closeConnection();
        }
    },
            
    async down(): Promise<void > {
        const current_version: string = 'v2';
        const prev_version: string = 'v1';
        const handler_db = await HandlerDB.getInstance();

        try {
            const sql_script_table: string = await handler_db.getSqlScript('create_table.sql', prev_version);
            await handler_db.execute(sql_script_table);

            const tableNames: string[] = ['books_authors', 'authors', `books`];

            const sql_script_get_all_info_from_books_authors: string = await handler_db.getSqlScript(
                'get_all_info_from_books_authors.sql',
                current_version
            );
            const sql_script_drop_table: string = await handler_db.getSqlScript('drop_table.sql');
            const sql_insert_new_book: string = await handler_db.getSqlScript(
                'insert_into_books_table.sql',
                prev_version
            );

            const [books] = await handler_db.execute(
                sql_script_get_all_info_from_books_authors
            ) as TBook[][]

            for (const book of books){
                await handler_db.execute(sql_insert_new_book, [
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
        } catch (err){
            throw new Error(`${err}`);
        } finally {
            await handler_db.closeConnection();
        }
    }
}