import express, { Request, Response, Router } from "express";
import * as User from "../models/user.js"
import {TypeBooks} from "types";

export const user_router: Router = express.Router();

user_router.get('/',  async (req: Request, res: Response) => {
    const query = req.query
    if (typeof query === "object" && query.length) console.log(query)
    const books: TypeBooks[] | null = await User.getBooks()
    if (books) {
        res.status(200).render('books-page.ejs',{books})
    } else {
        res.status(500).render('error-page.ejs');
    }
})

user_router.get('/api/v1/', (req: Request, res: Response) => {
    const query = req.query
    if (typeof query === "object" && query.length) console.log(query)
})
