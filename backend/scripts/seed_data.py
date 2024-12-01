import sqlite3

data = [
    {"code": "USA", "name": "United States", "population": 331000000, "gdp": 21137518, "data_references": "Source: IMF"},
    {"code": "CHN", "name": "China", "population": 1444216107, "gdp": 14722731, "data_references": "Source: IMF"},
    # Add more countries here
]

conn = sqlite3.connect('./data/exploronomics.db')
cursor = conn.cursor()

cursor.executemany("""
INSERT INTO countries (code, name, population, gdp, data_references)
VALUES (:code, :name, :population, :gdp, :data_references)
""", data)

conn.commit()
conn.close()
