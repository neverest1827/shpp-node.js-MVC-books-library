SELECT id, title, author, year, date, clicks, views FROM library
WHERE delete_time IS NULL
LIMIT ? OFFSET ?;