CREATE TABLE IF NOT EXISTS test_table (
    id SERIAL PRIMARY KEY,
    data VARCHAR (200),
    time_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);