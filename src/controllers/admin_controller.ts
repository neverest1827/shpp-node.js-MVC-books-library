import {Request, Response} from "express";
import * as Admin from '../models/admin.js';
import {TypeBook, TypeQuery, TypeQueryFilter, TypeResult} from "types";
import path from "path";

export async function logout(req: Request, res: Response){
    res.redirect('/');
}

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