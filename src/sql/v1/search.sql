SELECT id, title, author, description FROM library
WHERE title LIKE ? OR author LIKE ? or description LIKE ? AND delete_time IS NULL;