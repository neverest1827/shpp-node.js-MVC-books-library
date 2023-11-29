SELECT title from library
WHERE LOWER(REPLACE(title, ' ', '')) = LOWER(REPLACE(?, ' ', ''));