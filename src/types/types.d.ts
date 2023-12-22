type TBook = {
    [key: string]: string | number | boolean | null;
    id: number,
    isbn: string | null,
    title: string,
    author: string,
    description: string,
    year: string,
    pages: number | null,
    stars: number | null,
    date: string,
    clicks: number,
    views: number,
    event: boolean
    delete_time: string | null
} & DbResult

type QueryFilter = {
    filter: string;
    offset: string;
    limit: string;
}

type QuerySearch = {
    search: string
}

type Data = {
    [key: string] : TBook[] | TypeTotal | string | number
}

type ResultSuccess = {
    success: true,
    data?: Data | TBook
}

type ResultError = {
    success: false,
    msg: string
}

type Result = ResultSuccess | ResultError;

type TFormData = {
    book_title: string;
    book_year: string;
    book_author1: string;
    book_author2: string;
    book_author3: string;
    book_description: string;
}

type FormImage = { book_img: Express.Multer.File[] } | undefined

type AppPaths = {
    PATH_TO_STATIC_FOLDER: string,
    PATH_TO_VIEWS_FOLDER: string,
    PATH_TO_IMAGES: string
}


