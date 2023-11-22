SELECT id, title, author, (SELECT COUNT(*) FROM library) AS total
FROM library
LIMIT ? OFFSET ?;