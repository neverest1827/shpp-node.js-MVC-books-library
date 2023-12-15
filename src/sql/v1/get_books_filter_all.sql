SELECT id, title, author
FROM library
WHERE delete_time IS NULL
LIMIT ? OFFSET ?;