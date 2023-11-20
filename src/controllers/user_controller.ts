import {Request, Response} from "express";
import {TypeBooks, TypeQuery, TypeResult} from "types";
import * as User from "../models/user.js";

export async function getBooks(req: Request, res: Response): Promise<void>{
    try {
        res.status(200).render('books-page.ejs')
    } catch (err) {
        res.status(404).send({
            "success": false,
            "msg": "file not found"
        });
    }
}

export async function getFiltereBooks(req: Request, res: Response): Promise<void> {
    const {filter, offset, limit} = req.query as TypeQuery;
    const result: TypeResult = await User.getBooks(filter, offset, limit);
    if (result.success) {
        res.status(200).send(result);
    } else {
        res.status(500).send(result);
    }
}
