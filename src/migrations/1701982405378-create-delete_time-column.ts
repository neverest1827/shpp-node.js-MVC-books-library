const path_to_class: string = "../classes/data_base.js" || "./data_base.js"
const { DataBase } = await import(path_to_class);
// import {DataBase} from "../classes/data_base";

export default {
    async up(){
        const handler_db = await DataBase.getInstance();
        const sql_script: string = await handler_db.getSqlScript('create_delete_time_column.sql');
        await handler_db.execute(sql_script);
    },
            
    async down(){
        const handler_db = await DataBase.getInstance();
        const sql_script: string = await handler_db.getSqlScript('drop-delete_time-column.sql');
        await handler_db.execute(sql_script);
    }
}