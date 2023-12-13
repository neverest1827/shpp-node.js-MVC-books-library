import {TypeBook, TypeResult, TypeResultError, TypeResultSuccess, TypeTotal} from "types";
import {DataBase} from "../classes/data_base.js";

const default_offset: string = '0';
const handler_db: DataBase = await DataBase.getInstance();
const version: string | undefined = await getVersion();

export async function getBooks(filter: string, limit: string, offset: string): Promise<TypeResult> {
        offset = offset ? offset : default_offset;

        try {
            const sql_get_total: string =
                await handler_db.getSqlScript('get_total.sql', version);
            const sql_get_filtered_books: string =
                await handler_db.getSqlScript(`get_books_filter_${filter}.sql`, version);
            const [books] =
                await handler_db.execute(sql_get_filtered_books, [limit, offset]) as TypeBook[][];
            const [result] = await handler_db.execute(sql_get_total) as TypeTotal[][]
            return buildSuccessfulResult(books, result[0].total, offset, filter);
        } catch (err) {
            return getTextError(err);
        }
}

export async function search(searchText: string): Promise<TypeResult> {
    searchText = `%${searchText}%`;
    try {
        const sql_search: string = await handler_db.getSqlScript('search.sql', version);
        const [books] =
            await handler_db.execute(sql_search, [searchText, searchText, searchText]) as TypeBook[][]
        return buildSuccessfulResult(books, books.length);
    } catch (err) {
        return getTextError(err);
    }
}

export async function getBook(id: string): Promise<TypeResult> {
    try {
        const sql_get_book_by_id: string = await handler_db.getSqlScript('get_book_by_id.sql', version);
        const [books] = await handler_db.execute(sql_get_book_by_id, [id]) as TypeBook[][];
        return buildSuccessfulResult(books[0])
    } catch (err) {
        return getTextError(err);
    }
}

export async function updateBookStatistics(id: string): Promise<TypeResult>{
    try {
        const sql_update_book_statistics_by_id: string =
            await handler_db.getSqlScript('update_book_statistics_by_id.sql', version);
        await handler_db.execute(sql_update_book_statistics_by_id, [id]);
        return buildSuccessfulResult();
    } catch (err) {
        return getTextError(err);
    }
}
export async function updateViewsPage(id: string): Promise<TypeResult>{
    try {
        const sql_update_book_views_by_id: string =
            await handler_db.getSqlScript('update_book_views_by_id.sql', version);
        await handler_db.execute(sql_update_book_views_by_id, [id]);
        return buildSuccessfulResult();
    } catch (err) {
        return getTextError(err);
    }
}

function buildSuccessfulResult(
    data?: TypeBook[] | TypeBook, total?: number, offset?: string, filter?: string
): TypeResultSuccess {
    if (!data) return {success: true}
    if (!total && !offset) {
        return {
            success: true,
            data: data
        }
    }
    return {
        success: true,
        data: {
            books: data as TypeBook[],
            filter: filter,
            offset: offset,
            total: {
                amount: total,
            }
        }
    }
}

function buildFailedResult(msg: string): TypeResultError{
    return {
        success: false,
        msg: msg
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