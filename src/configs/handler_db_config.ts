import {PATH_TO_WORK_DIR, DISTRIBUTION_FOLDER} from "./global_config.js";
import path from "path";

const connect_config_file_name: string = 'db_connect_config.json';
const start_data_file_name: string = 'startData.csv';
const config_folder: string = 'configs';
const backup_folder: string = 'backup';
const sql_folder: string = 'sql';

export const handler_db_paths: HandlerDbPaths = {
    PATH_TO_BACKUP_FOLDER: path.join(PATH_TO_WORK_DIR, DISTRIBUTION_FOLDER, backup_folder),
    PATH_TO_SQL_SCRIPTS: path.join(PATH_TO_WORK_DIR, DISTRIBUTION_FOLDER, sql_folder),
    PATH_TO_START_DATA: path.join(PATH_TO_WORK_DIR, DISTRIBUTION_FOLDER, start_data_file_name),
    PATH_TO_CONFIG: path.join(PATH_TO_WORK_DIR, DISTRIBUTION_FOLDER, config_folder, connect_config_file_name)
}