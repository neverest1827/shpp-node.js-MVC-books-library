import {getTextError, getTotalBooksCount} from "../functions.js";
import {SecurityManager} from "../classes/security_manager.js";
import {HandlerDB} from "../classes/handler_db.js";
import {Migrate} from "../classes/migrate.js";
import {AppError} from "../configs/app_config";

const handler_db: HandlerDB = await HandlerDB.getInstance();
const security_manager: SecurityManager = SecurityManager.getInstance();
const version: string | undefined = await Migrate.getCurrentMigrationVersion()

/**
 * Retrieves filtered book information based on the provided query parameters
 *
 * @param queryObj - An object containing filter criteria, offset, and limit for pagination
 */
export async function getFilteredBooksInfo(queryObj: QueryFilter): Promise<Result> {
    const {filter, offset, limit} = queryObj;

    try {
        const totalRowsCount: number = await getTotalBooksCount(version);

        const isValidOffset: boolean = security_manager.checkOutOfRange(offset, totalRowsCount);
        const isValidLimit: boolean = security_manager.checkOutOfRange(limit, totalRowsCount);
        const isValidFilter: boolean = security_manager.validateFilter(filter);

        if (isValidFilter && isValidLimit && isValidOffset) {
            const sql_get_filtered_books: string = await handler_db.getSqlScript(
                `get_books_filter_${filter}.sql`,
                version
            );
            const [books] = await handler_db.execute(
                sql_get_filtered_books,
                [limit, offset]
            ) as TBook[][];

            return buildSuccessfulResult(books, totalRowsCount, offset, filter);
        }
        return buildFailedResult(AppError.BAD_REQUEST);

    } catch (err) {
        console.error(`Error receiving filtered books: ${err}`)
        throw new Error( getTextError(err) );

    } finally {
        await handler_db.closeConnection();
    }
}

/**
 * Searches for books based on the provided search query.
 *
 * @param query - An object containing the search criteria.
 */
export async function search(query: QuerySearch): Promise<Result> {
    const searchText: string = `%${query.search}%`;
    try {
        const sql_search: string = await handler_db.getSqlScript('search.sql', version);
        const [books] = await handler_db.execute(
            sql_search,
            [searchText, searchText, searchText]
        ) as TBook[][]
        return buildSuccessfulResult(books, books.length);

    } catch (err) {
        console.error(`Error searching for books: ${err}`);
        return buildFailedResult( getTextError(err) );

    } finally {
        await handler_db.closeConnection();
    }
}

/**
 * Retrieves detailed information for a specific book based on the provided book ID
 *
 * @param book_id - The unique identifier for the book
 */
export async function getBookInfo(book_id: string): Promise<Result> {
    try {
        const sql_get_book_by_id: string = await handler_db.getSqlScript('get_book_by_id.sql', version);
        const [books] = await handler_db.execute(sql_get_book_by_id, [book_id]) as TBook[][];
        return buildSuccessfulResult(books[0]);

    } catch (err) {
        console.error(`Error receiving book data: ${err}`)
        return buildFailedResult( getTextError(err) );

    } finally {
        await handler_db.closeConnection();
    }
}

/**
 * Updates the click statistics for a specific book based on the provided book ID.
 *
 * @param book_id - The unique identifier for the book.
 */
export async function updateBookClicks(book_id: string): Promise<Result> {
    try {
        const totalRowsCount: number = await getTotalBooksCount(version);
        const isValidId: boolean = security_manager.validateBookId(book_id, totalRowsCount);
        if (isValidId) {
            const sql_update_book_statistics_by_id: string = await handler_db.getSqlScript(
                'update_book_clicks_by_id.sql',
                version
            );
            await handler_db.execute(sql_update_book_statistics_by_id, [book_id]);
            return buildSuccessfulResult();
        }
        return buildFailedResult(AppError.BAD_REQUEST)
    } catch (err) {
        return buildFailedResult(getTextError(err));
    } finally {
        await handler_db.closeConnection();
    }
}

/**
 * Retrieves the content page of a specific book and updates its view count.
 *
 * @param book_id - The unique identifier for the book.
 */
export async function getBookPage(book_id: string): Promise<Result> {
    try {
        const total_rows_count: number = await getTotalBooksCount(version);
        const is_valid_id: boolean = security_manager.validateBookId(book_id, total_rows_count);
        if (is_valid_id) {
            const sql_update_book_views_by_id: string = await handler_db.getSqlScript(
                'update_book_views_by_id.sql',
                version
            );
            await handler_db.execute(sql_update_book_views_by_id, [book_id]);
            return buildSuccessfulResult();
        }
        return buildFailedResult(AppError.BAD_REQUEST);
    } catch (err) {
        console.error(`Error received book: ${err}`);
        return buildFailedResult( getTextError(err) );
    }

}

/**
 * Builds a successful result object based on the provided data, total count, offset, and filter.
 *
 * @param data - The data to include in the result (can be a single book or an array of books).
 * @param total - The total count of books (optional).
 * @param offset - The pagination offset (optional).
 * @param filter - The filter criteria used for the result (optional).
 */
function buildSuccessfulResult(
    data?: TBook[] | TBook, total?: number, offset?: string, filter?: string
): ResultSuccess {
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
            books: data,
            filter: filter,
            offset: offset,
            total: {
                amount: total,
            }
        }
    }
}

/**
 * Builds a failed result object with the provided error message.
 *
 * @param message - The error message to include in the result.
 */
function buildFailedResult(message: string): ResultError {
    return {
        success: false,
        msg: message
    }
}