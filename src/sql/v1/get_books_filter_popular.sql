SELECT id, title, author
FROM library
WHERE delete_time IS NULL
ORDER BY stars DESC
LIMIT ? OFFSET ?;