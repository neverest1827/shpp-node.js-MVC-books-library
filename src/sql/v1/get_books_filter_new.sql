SELECT id, title, author
FROM library
WHERE delete_time IS NULL
ORDER BY date DESC
LIMIT ? OFFSET ?;