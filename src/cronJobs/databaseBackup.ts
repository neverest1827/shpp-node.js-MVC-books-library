import {DataBase} from "../classes/data_base.js";

export async function databaseBackup(){
    try {
        const handler_db: DataBase = await DataBase.getInstance()
        await handler_db.createBackup();
        console.log('Backup created')
    } catch (err){
        if (err instanceof Error){
            console.log(err.message);
        } else {
            console.log('unknown')
        }
    }
}