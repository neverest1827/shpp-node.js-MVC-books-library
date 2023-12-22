import {AppError, APP_PATHS, APP_PORT} from "./configs/app_config.js";
import express, {Express, Request, Response} from "express"
import {admin_router} from "./routes/admin_router.js";
import {user_router} from "./routes/user_router.js";
import bodyParser from "body-parser";
import {cron_tasks} from "./cron.js";
import path from "path";

const app: Express = express();

app.use(express.static(APP_PATHS.PATH_TO_STATIC_FOLDER));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(admin_router);
app.use(user_router);

app.set('view engine', 'ejs');
app.set('views', APP_PATHS.PATH_TO_VIEWS_FOLDER);

/**
 * Route for processing the error of receiving the image from the server and reversing the default image
 */
app.get('/books-images/:id', (req: Request, res: Response): void => {
    res.sendFile(path.join(APP_PATHS.PATH_TO_IMAGES, 'not-found.jpg'));
});

app.all('*', (req: Request, res: Response) => {
    res.status(404);
    if (req.accepts('html')) {
        res.sendFile('404.ejs');
    } else if (req.accepts('json')) {
        res.json({"error": AppError.FILE_NOT_FOUND});
    } else {
        res.type('txt').send(AppError.FILE_NOT_FOUND);
    }
})

// Starting Cron tasks
for (const task of cron_tasks){
    task.start();
}

app.listen(APP_PORT, () => {
    console.log(`Server listen the port ${APP_PORT}`)
})