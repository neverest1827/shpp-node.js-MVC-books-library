import {RowDataPacket} from "mysql2/promise";
import {HandlerDB} from "./classes/handler_db.js";

/**
 * Retrieves the total count of rows from the database for a specific version.
 *
 * @param version - The version of the database schema.
 */
export async function getTotalRowsCount(version: string | undefined): Promise<number> {
    const handler_db: HandlerDB = await HandlerDB.getInstance();
    const sql_get_total_books_count: string = await handler_db.getSqlScript('get_total.sql', version);
    const [result] = await handler_db.execute(sql_get_total_books_count) as RowDataPacket[][]
    return result[0].total;
}

/**
 * Builds a successful result object based on the provided data, total count, offset, and filter.
 *
 * @param data - The data to include in the result (can be a single book or an array of books).
 * @param total - The total count of books (optional).
 * @param offset - The pagination offset (optional).
 * @param filter - The filter criteria used for the result (optional).
 */
export function buildSuccessfulResult(
    data?: TBook[] | TBook, total?: number, offset?: number, filter?: string
): ResultSuccess {

    if(data && total || total === 0) {
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
        };

    } else {
        return {
            success: true,
            data: data
        };
    }
}

/**
 * Builds a failed result object with the provided error message.
 *
 * @param message - The error message to include in the result.
 */
export function buildFailedResult(message: string): ResultError {
    return {
        success: false,
        msg: message
    }
}

/**
 * Retrieves the error message from an error object.
 *
 * @param err - The error object.
 */
export function getTextError(err: any): string{
    if (err instanceof Error) {
        return err.message;
    }
    return 'Unknown Error';
}