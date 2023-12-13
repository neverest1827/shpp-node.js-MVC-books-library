import {TypeData} from "types";

export class Book {
    isnb: string;
    title: string;
    author1: string;
    author2: string;
    author3: string;
    description: string;
    year: number;
    pages: number;
    stars: number;
    date: string;
    clicks: number;
    views: number;
    event: boolean;
    delete_time: null;

    constructor(data: TypeData) {
        this.isnb = data.book_isbn || null;
        this.title = data.book_title;
        this.author1 = data.book_author1;
        this.author2 = data.book_author2 || null;
        this.author3 = data.book_author3 || null;
        this.description = data.book_description;
        this.year = data.book_year;
        this.pages = data.book_pages || null;
        this.stars = data.book_pages || null;
        this.date = new Date(Date.now()).toISOString().slice(0, 19).replace("T", " ");
        this.clicks = 0;
        this.views = 0;
        this.event = false;
        this.delete_time = null;
    }

    getBookInfo(): (string | number | null | boolean)[] {
        return [
            this.isnb,
            this.title,
            this.getAuthors(),
            this.description,
            this.year,
            this.pages,
            this.stars,
            this.date,
            this.clicks,
            this.views,
            this.event,
            this.delete_time
        ]
    }

    getAuthors(){
        if (this.author2 || this.author3){
            const authors: string[] = [this.author1]
            if (this.author2) authors.push(this.author2)
            if (this.author3) authors.push(this.author3)
            return authors.join(', ');
        }
        return this.author1;
    }
}