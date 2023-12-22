import {PATH_TO_WORK_DIR} from "./global_config.js";
import path from "path";

const static_folder: string = 'static'
const views_folder: string = 'views'
const images_folder: string = 'books-images';
export const APP_PORT: number = 3000;
export const APP_PATHS: AppPaths = {
    PATH_TO_STATIC_FOLDER: path.join(PATH_TO_WORK_DIR, static_folder),
    PATH_TO_VIEWS_FOLDER: path.join(PATH_TO_WORK_DIR, views_folder),
    PATH_TO_IMAGES: path.join(PATH_TO_WORK_DIR, static_folder, images_folder)
}

export enum AppError {
    FILE_NOT_FOUND = "File Not Found",
    INTERNAL_ERROR = "Internal Server Error",
    BAD_REQUEST = "Incorrect data was transferred to the server"
}
