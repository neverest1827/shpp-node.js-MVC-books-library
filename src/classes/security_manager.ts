import {WHITE_LIST} from "../configs/security_manager_config.js";

/**
 * Manages security-related operations, including data shielding, filter validation,
 * range checks, book ID validation, and special character replacement.
 */
export class SecurityManager {
    private static instance: SecurityManager | undefined;
    whiteList: WhiteList;

    constructor() {
        this.whiteList = WHITE_LIST;
    }

    /**
     * Retrieves the singleton instance of SecurityManager.
     */
    static getInstance(): SecurityManager {
        if (!SecurityManager.instance) {
            SecurityManager.instance = new SecurityManager();
        }
        return SecurityManager.instance;
    }

    /**
     * Shields sensitive data in an array of books by replacing special characters.
     * @param data - An array of books containing sensitive data.
     */
    shieldData(data: TBook[]): TBook[] {
        if (data.length) {
            for (const book of data) {
                for (const key of Object.keys(book)) {
                    const value: string | number | boolean | null = book[key];
                    if (!value || key === 'date' || typeof value === 'number' || typeof value === 'boolean') {
                        continue;
                    }
                    book[key] = this.replaceSpecialChars(value);
                }
            }
            return data;
        }
        return [];
    }

    /**
     * Validates whether a filter is allowed based on the white list.
     *
     * @param filter - The filter to be validated.
     */
    validateFilter(filter: string): boolean {
        return WHITE_LIST.filters.includes(filter);
    }

    /**
     * Checks if a number is within a specified range.
     *
     * @param number The number to be checked.
     * @param total The upper limit of the range.
     */
    checkOutOfRange(number: string | number, total: number): boolean {
        number = Number(number);
        if (number || number === 0 && number % 1 === 0) {
            return number >= 0 && number <= total;
        }
        return false;
    }

    /**
     * Validates whether a book ID is within a specified range.
     *
     * @param bookId The book ID to be validated.
     * @param total The upper limit of the range.
     */
    validateBookId(bookId: string | number, total: number): boolean {
        bookId = Number(bookId);
        if (bookId && bookId % 1 === 0) {
            return bookId > 0 && bookId <= total;
        }
        return false;
    }

    /**
     * Replaces special characters in a string to prevent potential security issues.
     *
     * @param field The string containing special characters.
     */
    replaceSpecialChars(field: string): string {
        field = field.replace(/&/g, "&amp;");
        field = field.replace(/</g, "&lt;");
        field = field.replace(/>/g, "&gt;");
        field = field.replace(/"/g, "&quot;");
        field = field.replace(/'/g, "&apos;");
        return field;
    }
}