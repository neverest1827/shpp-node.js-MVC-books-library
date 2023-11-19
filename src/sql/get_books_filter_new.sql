SELECT id, title, author FROM library
# WHERE EXTRACT(DAY FROM DATEDIFF(NOW(), date)) < 3
ORDER BY date DESC;