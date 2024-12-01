const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to SQLite database
const db = new sqlite3.Database('./data/exploronomics.db');

// Fetch country data by country code
app.get('/api/country/:code', (req, res) => {
    const code = req.params.code;
    db.get('SELECT * FROM countries WHERE code = ?', [code], (err, row) => {
        if (err) {
            res.status(500).json({ error: 'Database error' });
        } else {
            res.json(row);
        }
    });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
