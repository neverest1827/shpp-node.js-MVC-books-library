import {AppError} from "../configs/app_config.js";
import * as Admin from '../models/admin.js';
import {Request, Response} from "express";
import fs from "fs/promises";

export async function getAdminPage(req: Request, res: Response): Promise<void> {
    try {
        await fs.access('views/books-page.ejs');
        res.status(200).render('admin-page.ejs');
    } catch (err) {
        res.status(404).render('404.ejs');
    }
}

export async function getBooksInfo(req: Request, res: Response): Promise<void> {
    try {
        const result: Result = await Admin.getBooksInfo(req.query as QueryFilter);
        if (result.success){
            res.status(200).send(result);
        } else {
            res.status(400).json({error: result.msg});
        }
    } catch (err) {
        res.status(500).json({error: AppError.INTERNAL_ERROR});
    }
}

export async function addNewBook(req: Request, res: Response): Promise<void> {
    try {
        const result: Result = await Admin.addNewBook(<FormImage>req.files, req.body);
        if (result.success){
            res.status(200).redirect('/admin');
        } else {
            res.status(400).json({error: result.msg})
        }
    } catch (err){
        res.status(500).json({error: AppError.INTERNAL_ERROR})
    }
}

export async function deleteBook(req: Request, res: Response): Promise<void>{
    const id: string = req.query.delete as string;
    const result: Result = await Admin.deleteBook(id);
    if (result.success) {
        res.status(200).send(result);
    } else {
        res.status(400).json({error: result.msg});
    }
}