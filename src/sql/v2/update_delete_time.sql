UPDATE books
SET delete_time = NOW()
WHERE book_id = ?;