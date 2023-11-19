CREATE TABLE library
(
    id INT primary key auto_increment,
    title VARCHAR(255),
    author VARCHAR(255),
    description VARCHAR(255),
    year INT,
    pages INT,
    stars INT,
    date DATETIME,
    clicks INT
)