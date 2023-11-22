import { Request, Response } from "express";
import {TypeQueryFilter, TypeQuerySearch, TypeResult} from "types";
import * as User from "../models/user.js";

export async function getIndex(req: Request, res: Response): Promise<void>{
    try {
        res.status(200).render('books-page.ejs')
    } catch (err) {
        res.status(404).send({
            "success": false,
            "msg": "file not found"
        });
    }
}

export async function getFilteredBooks(req: Request, res: Response): Promise<void> {
    const {filter, limit, offset} = req.query as TypeQueryFilter;
    const result: TypeResult = await User.getBooks(filter, limit, offset);
    if (result.success) {
        res.status(200).send(result);
    } else {
        res.status(500).send(result);
    }
}

export async function search(req: Request, res: Response) {
    const query: TypeQuerySearch = req.query as TypeQuerySearch
    const result: TypeResult = await User.search(query.search);
    if (result.success) {
        res.status(200).send(result);
    } else {
        res.status(500).send(result);
    }
}
