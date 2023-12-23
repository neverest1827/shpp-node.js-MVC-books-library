import * as AdminController from "../controllers/admin_controller.js"
import expressBasicAuth from "express-basic-auth";
import express, {Router} from "express";
import multer from "multer";
export const admin_router: Router = express.Router();

/**
 * To store images from a form in a buffer
 */
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/**
 * Define the form handling middleware using multer to process file uploads.
 * Each field in the form is specified with a unique name and the maximum number of files allowed.
 */
const formMiddleware = upload.fields([
    { name: 'book_title', maxCount: 1 },
    { name: 'book_year', maxCount: 1 },
    { name: 'book_img', maxCount: 1 },
    { name: 'book_author1', maxCount: 1 },
    { name: 'book_author2', maxCount: 1 },
    { name: 'book_author3', maxCount: 1 },
    { name: 'book_description', maxCount: 1 },
]);

/**
 * Define a middleware for basic authentication using the express-basic-auth library.
 */
const loginMiddleware = expressBasicAuth({
    users: { 'admin': 'admin' },
    challenge: true,
    unauthorizedResponse: 'Unauthorized'
});

admin_router.get('/admin', loginMiddleware, AdminController.getAdminPage)
admin_router.post('/admin/api/v1/', formMiddleware, AdminController.addNewBook)
admin_router.get('/admin/api/v1/', AdminController.getBooksInfo)
admin_router.get('/admin/api/v1/books/:bookId/remove', AdminController.deleteBook)
