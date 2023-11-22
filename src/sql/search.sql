SELECT id, title, author, description FROM library
WHERE title LIKE ? OR author LIKE ? or description LIKE ?;