import cron from 'node-cron';
import {deleteBooks} from "./cronJobs/deleteBooks.js";
import {databaseBackup} from "./cronJobs/databaseBackup.js";

export const tasks = [
    cron.schedule('* * 1 * * *', deleteBooks),
    cron.schedule('* * 0 * * *', databaseBackup)
]



