import { Request, Response } from "express";
import * as User from "../models/user.js";
import {AppError} from "../configs/app_config";
import fs from "fs/promises";

export async function getIndexPage(req: Request, res: Response): Promise<void>{
    try {
        await fs.access('views/books-page.ejs');
        res.status(200).render('books-page.ejs')
    } catch (err) {
        res.status(404).render('404.ejs');
    }
}

export async function getFilteredBooks(req: Request, res: Response): Promise<void> {
    try {
        const result: Result = await User.getFilteredBooksInfo(req.query as QueryFilter);
        if (result.success) {
            res.status(200).send(result);
        } else {
            res.status(400).json({error: result.msg});
        }
    } catch (err) {
        res.status(500).json({error: AppError.INTERNAL_ERROR})
    }
}

export async function getFoundBooks(req: Request, res: Response): Promise<void> {
    const result: Result = await User.search(req.query as QuerySearch);
    if (result.success) {
        res.status(200).send(result);
    } else {
        res.status(500).json({error: AppError.INTERNAL_ERROR});
    }
}

export async function getBookInfo(req: Request, res: Response): Promise<void> {
    const result: Result = await User.getBookInfo(req.params.book_id);
    if (result.success) {
        res.status(200).send(result);
    } else {
        res.status(500).json({error: AppError.INTERNAL_ERROR});
    }
}

export async function getBookPage(req: Request, res: Response): Promise<void> {
    const result: Result = await User.getBookPage(req.params.book_id)
    if (result.success){
        res.status(200).render('book-page.ejs');
    } else {
        res.status(404).render('404.ejs');
    }
}

export async function updateBookClicks(req: Request, res: Response): Promise<void> {
    const id: string = req.query.update as string
    const result: Result = await User.updateBookClicks(id);
    if (result.success) {
        res.status(200).send(result);
    } else {
        res.status(500).json({error: AppError.INTERNAL_ERROR});
    }
}

export async function getSearchPage(req: Request, res: Response): Promise<void> {
    const query: QuerySearch = req.query as QuerySearch;
    try {
        await fs.access('views/search-page.ejs');
        res.render('search-page.ejs', {query})
    } catch (err){
        res.status(404).render('404.ejs');
    }
}
