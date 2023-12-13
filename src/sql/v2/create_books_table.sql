CREATE TABLE IF NOT EXISTS books (
    book_id INT PRIMARY KEY AUTO_INCREMENT,
    isbn VARCHAR(255),
    title VARCHAR(255),
    description TEXT,
    year INT,
    pages INT,
    stars INT,
    date DATETIME,
    clicks INT,
    views INT,
    event BOOLEAN,
    delete_time DATETIME
);