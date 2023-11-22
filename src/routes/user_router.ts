import express, { Request, Response, Router } from "express";
export const user_router: Router = express.Router();
import * as UserController from "../controllers/user_controller.js"
import {TypeQuery} from "types";

user_router.get('/',  (req:Request, res: Response) =>  UserController.getIndex(req, res));

user_router.get('/api/v1/books', async (req: Request, res: Response) => {
    switch (Object.keys(req.query)[0]){
        case 'filter': return await UserController.getFilteredBooks(req, res);
        case 'search': return await UserController.search(req, res);
    }
});

user_router.get('/search', (req: Request, res: Response) => UserController.search(req, res));