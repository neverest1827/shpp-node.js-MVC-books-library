import mysql, {Connection} from "mysql2/promise";
import fs from "fs/promises";

const config: string = await fs.readFile('./config.json', 'utf-8');
export const connection: Connection = await mysql.createConnection(JSON.parse(config));

