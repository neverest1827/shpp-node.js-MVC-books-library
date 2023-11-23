import express, { Request, Response, Router } from "express";
export const user_router: Router = express.Router();
import * as UserController from "../controllers/user_controller.js"


user_router.get('/', UserController.getIndex);
user_router.get('/search', UserController.search);
user_router.get('/books/:book_id', UserController.getBookPage)
user_router.get('/api/v1/books/:book_id', UserController.getBook)
user_router.get('/api/v1/books', async (req: Request, res: Response) => {
    switch (Object.keys(req.query)[0]){
        case 'filter': return await UserController.getFilteredBooks(req, res);
        case 'search': return await UserController.search(req, res);
        case 'updateId': return await UserController.updateBookStatistics(req, res);
    }
});

