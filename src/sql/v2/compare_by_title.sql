SELECT title from books
WHERE LOWER(REPLACE(title, ' ', '')) = LOWER(REPLACE(?, ' ', ''));