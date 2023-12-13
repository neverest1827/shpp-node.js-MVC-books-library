SELECT
    b.book_id as id,
    b.isbn,
    b.title,
    GROUP_CONCAT(a.author_name SEPARATOR ', ') AS author,
    b.year,
    b.event,
    b.description,
    b.stars
FROM books_authors ba JOIN books b ON ba.book_id = b.book_id JOIN authors a ON ba.author_id = a.author_id
WHERE b.book_id = ?
GROUP BY b.book_id, b.isbn, b.title, b.year, b.event, b.description, b.stars;
