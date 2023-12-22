import cron, {ScheduledTask} from 'node-cron';
import {deleteBooks} from "./cronJobs/deleteBooks.js";
import {databaseBackup} from "./cronJobs/databaseBackup.js";

export const cron_tasks: ScheduledTask[] = [
    cron.schedule('0 0 * * * *', deleteBooks),
    cron.schedule('0 0 0 * * *', databaseBackup)
]



