import fast_csv from "fast-csv";
import fs from "fs/promises";
import mysql, {Connection, RowDataPacket} from "mysql2/promise";
import {TypeBook, TypeData} from "types";

const config: string = await fs.readFile('../../config.json', 'utf-8');
const tableName: string = 'library'

async function importFromCsv(tableName: string){
    try {
        const data: string = await fs.readFile('data.csv', "utf-8");
        const csvData: TypeData = [];

        fast_csv
            .parseString(data, { headers: true })
            .on("data", function (row) {
                csvData.push(row);
            })
            .on("end", async function () {
                csvData.shift();
            });

        const connection: Connection = await mysql.createConnection(JSON.parse(config));

        for(const key of Object.keys(csvData)){
            const bookInfo: TypeData = prepareData(csvData[key]);
            try {
                const sql_script: string = await fs.readFile('fill_table.sql', 'utf-8');
                await connection.execute(sql_script, bookInfo);
            } catch (err){
                console.log(err)
            } finally {
                await connection.end();
            }
        }
        console.log('export to csv - success')
    } catch (err){
        console.log(err)
    }

}

function prepareData(data: TypeData): TypeData{
    const date = data.date ? data.date : new Date(Date.now()).toDateString();
    return [
        data.isbn ? data.isbn : null,
        data.title,
        data.author,
        data.description,
        data.year,
        data.pages ? data.pages : null,
        data.stars ? data.stars : null,
        date.slice(0, 19).replace("T", " "),
        data.clicks ? data.clicks : null,
        data.views ? data.views : null,
        !!data.event,
        data.delete_time ? data.delete_time : null
    ]
}

await importFromCsv(tableName);