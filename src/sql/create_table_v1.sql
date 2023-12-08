CREATE TABLE IF NOT EXISTS library
(
    id INT primary key auto_increment,
    isbn VARCHAR(255),
    title VARCHAR(255),
    author VARCHAR(255),
    description TEXT,
    year INT,
    pages INT,
    stars INT,
    date DATETIME,
    clicks INT,
    views INT,
    event BOOLEAN
)