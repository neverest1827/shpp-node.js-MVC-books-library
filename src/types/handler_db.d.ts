type Config = {
    host: string,
    user: string,
    password: string,
    database: string
}

type HandlerDbPaths = {
    PATH_TO_SQL_SCRIPTS: string,
    PATH_TO_CONFIG: string,
    PATH_TO_BACKUP_FOLDER: string
    PATH_TO_START_DATA: string
}

type SqlScriptCache = {
    [key: string]: string
}

type DbResult = [
    OkPacket |
    ResultSetHeader[] |
    RowDataPacket[] |
    RowDataPacket[][] |
    OkPacket[] |
    ProcedureCallPacket,
    FieldPacket[]
]