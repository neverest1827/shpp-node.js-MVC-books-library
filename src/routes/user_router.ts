import express, { Request, Response, Router } from "express";
export const user_router: Router = express.Router();
import * as UserController from "../controllers/user_controller.js"

user_router.get('/',  (req:Request, res: Response) =>  UserController.getBooks(req, res));

user_router.get(
    '/api/v1/books',
    (req: Request, res: Response) => UserController.getFiltereBooks(req, res)
);