import express, { Request, Response, Router } from "express";
import expressBasicAuth from "express-basic-auth";
import * as AdminController from "../controllers/admin_controller.js"
export const admin_router: Router = express.Router();
import path from "path";


let credentials: {[key: string]: string}  = { 'admin': 'admin' };

const loginMiddleware = expressBasicAuth({
    users: credentials,
    challenge: true,
    unauthorizedResponse: 'Unauthorized'
});

const logoutMiddleware = function (){
    credentials = {};
}

admin_router.get('/admin', loginMiddleware, AdminController.getAdminPage)
admin_router.get('/logout', AdminController.logout)

admin_router.get('/admin/api/v1/', AdminController.getBooksInfo)