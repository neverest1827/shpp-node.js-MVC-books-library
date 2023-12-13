SELECT author_id, author_name from authors
WHERE LOWER(REPLACE(author_name, ' ', '')) = LOWER(REPLACE(?, ' ', ''));