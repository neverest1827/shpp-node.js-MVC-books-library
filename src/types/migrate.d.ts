type Migrations = {
    [key: string] : MigrationObject
}

type MigrationObject = {
    up(): Promise<void>;
    down(): Promise<void>;
}

type MigratePaths = {
    PATH_TO_MIGRATIONS_FOLDER: string,
    PATH_TO_LOG_FILE: string
}

type MigrationMethods = "up" | "down";

type MigrateMethods = 'create' | 'up' | 'down' | 'ls';