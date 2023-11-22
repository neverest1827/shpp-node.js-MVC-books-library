import express, { Request, Response, Router } from "express";
export const admin_router: Router = express.Router();
import path from "path";

admin_router.get('/admin', (req: Request, res: Response) => {
    res.render(path.join('admin-page.ejs'))
})

admin_router.get('/admin/api/v1/', (req: Request, res: Response) => {
})