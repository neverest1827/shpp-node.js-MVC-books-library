import express, {Request, Response, Router} from "express";
import expressBasicAuth from "express-basic-auth";
import * as AdminController from "../controllers/admin_controller.js"
export const admin_router: Router = express.Router();
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const handleForm = upload.fields([
    { name: 'book_title', maxCount: 1 },
    { name: 'book_year', maxCount: 1 },
    { name: 'book_img', maxCount: 1 },
    { name: 'book_img', maxCount: 1 },
    { name: 'book_author1', maxCount: 1 },
    { name: 'book_author2', maxCount: 1 },
    { name: 'book_author3', maxCount: 1 },
    { name: 'book_description', maxCount: 1 },
]);

let credentials: { [key: string]: string }  = { 'admin': 'admin' };

const loginMiddleware = expressBasicAuth({
    users: credentials,
    challenge: true,
    unauthorizedResponse: 'Unauthorized'
});

const logoutMiddleware = function (){
    credentials = {};
}

admin_router.get('/admin', loginMiddleware, AdminController.getAdminPage)
admin_router.get('/admin/api/v1/', AdminController.getBooksInfo)
admin_router.post('/admin/api/v1/', handleForm, AdminController.addNewBook)
admin_router.put('/admin/api/v1/', AdminController.deleteBook)
