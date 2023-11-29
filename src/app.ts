import express, {Express} from "express"
import { fileURLToPath } from 'url';
import bodyParser from "body-parser";
import path from "path";
import {user_router} from "./routes/user_router.js";
import {admin_router} from "./routes/admin_router.js";

const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = path.dirname(__filename);
const app: Express = express();
const port: number = 3000;

app.use(express.static(path.join(__dirname, '../static')));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(user_router);
app.use(admin_router)

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, './views'));

app.listen(port, () => {
    console.log(`Server listen the port ${port}`)
})