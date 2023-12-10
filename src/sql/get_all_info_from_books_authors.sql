SELECT
    b.book_id,
    b.isbn,
    b.title,
    GROUP_CONCAT(a.author_name SEPARATOR ', ') AS authors,
    b.description,
    b.year,
    b.pages,
    b.stars,
    b.date,
    b.clicks,
    b.views,
    b.event,
    b.delete_time
FROM
    books_authors ba
        JOIN
    books b ON ba.book_id = b.book_id
        JOIN
    authors a ON ba.author_id = a.author_id
GROUP BY
    b.book_id;