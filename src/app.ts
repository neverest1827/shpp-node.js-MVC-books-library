import express, {Express, Request, Response} from "express"
import { fileURLToPath } from 'url';
import path from "path";
import {user_router} from "./controllers/user_controller.js";

const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = path.dirname(__filename);
const app: Express = express();
const port: number = 3000;



app.use(express.static(path.join(__dirname, '../static')));
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '../views'));

app.use(user_router);

app.get('/admin', (req: Request, res: Response) => {
    res.render(path.join('admin-page.ejs'))
})

app.get('/admin/api/v1/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../static', './admin-panel/admin-page.ejs'))
})

app.listen(port, () => {
    console.log(`Server listen the port ${port}`)
})