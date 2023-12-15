SELECT book_id as id
FROM books
WHERE TIMESTAMPDIFF(HOUR, delete_time, NOW()) > 1;