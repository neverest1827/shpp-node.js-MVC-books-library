import fs from "fs/promises";
import mysql, {Connection} from "mysql2/promise";
const path_to_class: string = "../classes/data_base" || "./data_base.js"

export default {

    async up(): Promise<void>{

        const sql_script: string = await fs.readFile('./sql/create_table_v1.sql', 'utf-8');
        const path_to_config: string = "../config.json";
        const config: string = await fs.readFile(path_to_config, 'utf-8');
        const connection: Connection = await mysql.createConnection(JSON.parse(config));

        try {
            await connection.execute(sql_script)
        } catch (err){
            console.log(err)
        } finally {
            await connection.end()
        }
    },

    async down(): Promise<void>{
        const sql_script: string = await fs.readFile('./sql/drop_table_v1.sql', 'utf-8');
        const path_to_config: string = "../config.json";
        const config: string = await fs.readFile(path_to_config, 'utf-8');
        const connection: Connection = await mysql.createConnection(JSON.parse(config));

        try {
            await connection.execute(sql_script);
        } catch (err){
            console.log(err)
        } finally {
            await connection.end();
        }
    }
}