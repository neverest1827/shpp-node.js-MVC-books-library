import {HandlerDB} from "../classes/handler_db.js";

export async function databaseBackup(): Promise<void> {
    try {
        const handler_db: HandlerDB = await HandlerDB.getInstance()
        await handler_db.createBackup();
        console.log('Backup created');
    } catch (err){
        console.error(`Error creating a backup: ${err}`);
    }
}