export type TypeBooks = {
    [key: string]: string | number;
}

export type TypeQuery = {
    filter: string;
    offset: string;
    limit: string;
}


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
