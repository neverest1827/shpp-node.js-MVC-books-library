/**
 * Represents a book with various properties and methods for book-related operations.
 */
export class Book {
    private readonly _isbn: string;
    private readonly _title: string;
    private readonly _authors: string;
    private readonly _description: string;
    private readonly _year: number;
    private readonly _pages: number;
    private readonly _stars: number;
    private readonly _date: string;
    private readonly _clicks: number;
    private readonly _views: number;
    private readonly _event: boolean;
    private readonly _delete_time: null;

    constructor(data: Data) {
        this._isbn = data.book_isbn || null;
        this._title = data.book_title;
        this._authors = this.uniteAuthors(data.book_author1, data.book_author2, data.book_author3);
        this._description = data.book_description;
        this._year = data.book_year;
        this._pages = data.book_pages || null;
        this._stars = data.book_stars || null;
        this._date = this.getFormattedDate();
        this._clicks = 0;
        this._views = 0;
        this._event = false;
        this._delete_time = null;
    }

    /**
     * Retrieves an array containing book information.
     */
    getBookInfo(): (string | number | null | boolean)[] {
        return [
            this._isbn,
            this._title,
            this._authors,
            this._description,
            this._year,
            this._pages,
            this._stars,
            this._date,
            this._clicks,
            this._views,
            this._event,
            this._delete_time
        ];
    }

    /**
     * Combines author names into a single string.
     *
     * @param author1 The first author's name.
     * @param author2 The second author's name (optional).
     * @param author3 The third author's name (optional).
     */
    uniteAuthors(author1: string, author2: string | undefined, author3: string | undefined): string {
        if (author2 || author3) {
            const authors: string[] = [];
            authors.push(author1);
            if (author2) authors.push(author2);
            if (author3) authors.push(author3);
            return authors.join(', ');
        }
        return author1;
    }

    /**
     * Retrieves the combined author names.
     */
    getAuthors() {
        return this._authors;
    }

    /**
     * Retrieves the formatted date string based on the current date and time.
     */
    getFormattedDate(): string {
        return new Date(Date.now())
            .toISOString()
            .slice(0, 19)
            .replace("T", " ");
    }
}