import fs from "fs/promises";
import fast_csv from "fast-csv"
import mysql, {Connection, RowDataPacket} from "mysql2/promise";

const config: string = await fs.readFile('../../config.json', 'utf-8');
const tableName: string = 'library'

async function exportToCsv(tableName: string): Promise<void> {
    const connection: Connection = await mysql.createConnection(JSON.parse(config));
    try {
        const [result] = await connection.execute<RowDataPacket[]>(`SELECT * FROM ${tableName}`);
        const jsonData = JSON.parse(JSON.stringify(result));

        await fs.writeFile('data.csv', fast_csv.write(jsonData, {headers: true}))
        console.log('export to csv - success')
    } catch (err){
        console.log(err)
    } finally {
        await connection.end();
    }
}

await exportToCsv(tableName);