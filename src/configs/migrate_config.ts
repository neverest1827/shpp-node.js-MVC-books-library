import path from "path";
import {PATH_TO_WORK_DIR, DISTRIBUTION_FOLDER, DEVELOPMENT_FOLDER} from "./global_config.js";

const migration_folder: string = 'migrations';
const log_file_name: string = 'migrate_log.json';
export const TARGET_DIR: string = DISTRIBUTION_FOLDER; // uncomment if you need save created migration file to 'dist'
// export const TARGET_DIR: string = development_folder;  //uncomment if you need save created migration file to 'src'


export const MIGRATE_PATHS: MigratePaths = {
    PATH_TO_MIGRATIONS_FOLDER: path.join(PATH_TO_WORK_DIR, TARGET_DIR, migration_folder),
    PATH_TO_LOG_FILE: path.join(PATH_TO_WORK_DIR, DISTRIBUTION_FOLDER, log_file_name)
}


export enum Error {
    NOT_VALID = "The name of the migration was not specified or incorrect",
    NOT_COMPLETED = "Not a single migration has been completed. In order to perform a downgrade, you need to have " +
"some kind of migration file executed",
    TARGET_NOT_BIGGER = 'Target migration must be bigger than current migration',
    CURRENT_NOT_BIGGER = 'Current migration must be bigger than or equal to target migration'
}

export enum Method {
    DOWN = 'down',
    UP = 'up'
}

export enum Extension {
    JS = '.js',
    TS = '.ts'
}
