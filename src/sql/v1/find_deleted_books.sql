SELECT id
FROM library
WHERE TIMESTAMPDIFF(HOUR, delete_time, NOW()) > 1;