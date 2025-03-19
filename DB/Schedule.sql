USE hsj;

DROP TABLE IF EXISTS Schedule;

CREATE TABLE Schedule (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    title VARCHAR(100),
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

SELECT COUNT(*) AS total_count FROM Schedule;
select * from Schedule;