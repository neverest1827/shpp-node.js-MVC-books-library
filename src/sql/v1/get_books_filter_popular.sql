SELECT id, title, author
FROM library
ORDER BY stars DESC
LIMIT ? OFFSET ?;