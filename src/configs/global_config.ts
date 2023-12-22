import path from "path";
import {fileURLToPath} from "url";

export const DISTRIBUTION_FOLDER: string = 'dist';
export const DEVELOPMENT_FOLDER: string = 'src';

const path_to_file: string = path.dirname(fileURLToPath(import.meta.url));
export const PATH_TO_WORK_DIR: string = path_to_file.substring(0, path_to_file.indexOf(DISTRIBUTION_FOLDER));