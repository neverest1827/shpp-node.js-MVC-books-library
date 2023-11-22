SELECT id, title, author, (SELECT COUNT(*) FROM library) AS total
FROM library
ORDER BY stars DESC
LIMIT ? OFFSET ?;