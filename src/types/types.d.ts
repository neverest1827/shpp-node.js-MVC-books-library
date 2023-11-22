export type TypeBooks = {
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


type TypeTotal = {
    amount: number
}

type TypeData = {
    [key: string] : TypeBooks[] | TypeTotal | string | number
}

type TypeResultSuccess = {
    success: boolean,
    data: TypeData
}

type TypeResultError = {
    success: boolean,
    msg: string
}

export type TypeResult = TypeResultSuccess | TypeResultError;
