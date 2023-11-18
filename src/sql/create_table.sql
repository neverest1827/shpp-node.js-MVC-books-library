CREATE TABLE library
(
    id INT primary key auto_increment,
    name VARCHAR(255),
    author VARCHAR(255),
    description VARCHAR(255),
    year INT,
    pages INT,
    stars INT,
    date DATETIME,
    path VARCHAR(255),
    clicks INT
)