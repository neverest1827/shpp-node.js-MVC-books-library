import {Request, Response} from "express";
import {TypeBooks, TypeQuery} from "types";
import * as User from "../models/user.js";

export async function getBooks(req: Request, res: Response): Promise<void>{
    console.log('/')
    try {
        res.status(200).render('books-page.ejs')
    } catch (err) {
        res.status(404).send({
            "success": false,
            "msg": "file not found"
        });
    }
}

export async function filterBooks(req: Request, res: Response): Promise<void> {
    console.log(req.query)
    console.log('api')
    const {filter, offset, limit} = req.query as TypeQuery;
    const books: TypeBooks[] | null = await User.getBooks(filter, offset, limit);
    if (books) {
        res.status(200).send({
            "success": true,
            "data": {
                "books": books,
                "total": {
                    "amount": +limit
                }
            }
        });
    } else {
        res.status(500).send({
            "success": false,
            "msg": "Server error"
        });
    }
}
