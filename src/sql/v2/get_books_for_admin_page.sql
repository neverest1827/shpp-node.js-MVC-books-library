SELECT
    b.book_id AS id,
    b.title,
    GROUP_CONCAT(a.author_name SEPARATOR ', ') AS author,
    b.year,
    b.date,
    b.clicks,
    b.views
FROM books_authors ba JOIN books b ON ba.book_id = b.book_id JOIN authors a ON ba.author_id = a.author_id

GROUP BY b.book_id
LIMIT ? OFFSET ?;
