import mysql from "mysql2"

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'admin',
    password: 'Zaq1W2e34',
    database: 'books_lib',
})

// Подключение к базе данных
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});