CREATE TABLE guestbook (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL
);

INSERT INTO guestbook (name, message, created_at) 
VALUES ('Leonardo', 'Hello world from local D1!', '2026-08-12T00:00:00Z');