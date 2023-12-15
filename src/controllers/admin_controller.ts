import {Request, Response} from "express";
import * as Admin from '../models/admin.js';
import { TypeQueryFilter, TypeResult } from "types";

export function getAdminPage(req: Request, res: Response){
    res.render('admin-page.ejs')
}

export async function getBooksInfo(req: Request, res: Response) {
    const query: TypeQueryFilter = req.query as TypeQueryFilter;
    const result: TypeResult = await Admin.getBooksInfo(query.offset, query.limit);
    if (result.success){
        res.status(200).send(result)
    } else {
        res.status(500).send(result)
    }
}

export async function addNewBook(req: Request, res: Response) { //TODO переробити щоб було звуження типів (щось з типами)
    const result: TypeResult = await Admin.addNewBook(req);
    if (result.success){
        res.status(200).redirect('/admin');
    } else {
        res.status(400).send({"Error": "err"})
    }
}

export async function deleteBook(req: Request, res: Response){
    const id: string = req.query.delete as string;
    const result: TypeResult = await Admin.deleteBook(id);
    if (result.success) {
        res.status(200).send(result);
    }
    else {
        res.status(400).send({ "Error": "err" });
    }
}