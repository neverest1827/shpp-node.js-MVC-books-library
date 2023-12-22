import * as UserController from "../controllers/user_controller.js"
import express, { Request, Response, Router } from "express";
export const user_router: Router = express.Router();

user_router.put('/api/v1/books', UserController.updateBookClicks)
user_router.get('/api/v1/books/:book_id', UserController.getBookInfo)
user_router.get('/books/:book_id', UserController.getBookPage)
user_router.get('/search', UserController.getSearchPage);
user_router.get('/', UserController.getIndexPage);

user_router.get('/api/v1/books', async (req: Request, res: Response): Promise<void> => {
    switch (Object.keys(req.query)[0]){
        case 'filter': return await UserController.getFilteredBooks(req, res);
        case 'search': return await UserController.getFoundBooks(req, res);
    }
});

