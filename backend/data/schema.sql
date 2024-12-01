CREATE TABLE countries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    population INTEGER NOT NULL,
    gdp REAL NOT NULL,
    data_references TEXT
);
