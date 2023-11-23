export type TypeBook = {
    [key: string]: string | number;
}


type TypeQueryFilter = {
    filter: string;
    offset: string;
    limit: string;
}

type TypeQuerySearch = {
    search: string
}

export type TypeQuery = TypeQueryFilter | TypeQuerySearch

type TypeData = {
    [key: string] : TypeBook[] | TypeTotal | string | number
}

type TypeResultSuccess = {
    success: boolean,
    data: TypeData | TypeBook
}

type TypeResultError = {
    success: boolean,
    msg: string
}

export type TypeResult = TypeResultSuccess | TypeResultError;

type TypeDatabaseResult = OkPacket | RowDataPacket[] | ResultSetHeader[] | RowDataPacket[][] | OkPacket[] | ProcedureCallPacket;

export type TypeTotal = {
    total: number
} & TypeDatabaseResult;


