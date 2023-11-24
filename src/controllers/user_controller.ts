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

export async function getBook(req: Request, res: Response) {
    const result: TypeResult = await User.getBook(req.params.book_id);
    if (result.success) {
        res.status(200).send(result);
    } else {
        res.status(500).send(result);
    }
}

export async function getBookPage(req: Request, res: Response){
    const id = +req.params.book_id
    if (id) await User.updateViewsPage(req.params.book_id);   //TODO виправити костиль, викликається 3 рази
    try {
        res.status(200).render('book-page.ejs')
    } catch (err) {
        res.status(404).send({
            "success": false,
            "msg": "file not found"
        });
    }
}

export async function updateBookStatistics(req: Request, res: Response){
    const id: string = req.query.update as string
    const result: TypeResult = await User.updateBookStatistics(id);
    if (result.success) {
        res.status(200).send(result);
    } else {
        res.status(500).send(result);
    }
}
