SELECT id, title, author
FROM library
ORDER BY date DESC
LIMIT ? OFFSET ?;