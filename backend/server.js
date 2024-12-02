const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const csvParser = require('csv-parser');
require('dotenv').config();

const app = express();
app.use(cors());

const PORT = process.env.PORT || 5000;

const csvFilePath = path.join(__dirname, 'data', 'world_economic_data_2023_1999.csv');

// Parse the CSV and filter data for the requested country
const parseCSV = async (country) => {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(csvFilePath)
            .pipe(csvParser())
            .on('data', (data) => {
                if (data['Country Name'] === country) {
                    // Extract only the relevant fields
                    const entry = {
                        seriesName: data['Series Name'],
                        values: {}
                    };
                    // Loop through year columns and collect data
                    for (const key in data) {
                        if (key.match(/\d{4} \[YR\d{4}\]/)) {
                            const year = key.split(' ')[0]; // Extract the year
                            entry.values[year] = data[key] === '..' ? null : data[key]; // Handle missing data
                        }
                    }
                    results.push(entry);
                }
            })
            .on('end', () => resolve(results))
            .on('error', (err) => reject(err));
    });
};

app.get('/api/country-data', async (req, res) => {
    const { country } = req.query;
    if (!country) {
        return res.status(400).json({ error: 'Country parameter is required' });
    }

    try {
        const data = await parseCSV(country);
        if (data.length === 0) {
            return res.status(404).json({ error: 'Country not found' });
        }

        res.json(data);
    } catch (error) {
        console.error('Error reading CSV:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
