SELECT id, title, author, (SELECT COUNT(*) FROM library) AS total
FROM library
ORDER BY date DESC
LIMIT ? OFFSET ?;