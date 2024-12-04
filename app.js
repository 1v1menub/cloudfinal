require('dotenv').config(); 

const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = 8080;

app.use(express.json());

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});


app.get('/heartbeat', (req, res) => {
  res.status(200).json({
    message: "API is alive",
    timestamp: new Date().toISOString()
  });
});

app.get('/last-number', async (req, res) => {
    try {
      const result = await pool.query('SELECT id, number, total_sum FROM numbers ORDER BY id DESC LIMIT 1');
      
      if (result.rows.length === 0) {
        return res.status(404).send('No data found');
      }
      
      res.json({
        id: result.rows[0].id,
        number: result.rows[0].number,
        total_sum: result.rows[0].total_sum
      });
    } catch (err) {
      console.error('Error fetching last number', err.stack);
      res.status(500).send('Internal Server Error');
    }
  });

app.post('/add-number', async (req, res) => {
    const { number } = req.body;

    if (typeof number !== 'number') {
        return res.status(400).send('Invalid number format. Must be a number.');
    }

    try {
        const result = await pool.query('SELECT total_sum FROM numbers ORDER BY id DESC LIMIT 1');
        const lastTotalSum = result.rows.length > 0 ? result.rows[0].total_sum : 0;

        const newTotalSum = lastTotalSum + number;

        const insertResult = await pool.query(
        'INSERT INTO numbers (number, total_sum) VALUES ($1, $2) RETURNING id, number, total_sum',
        [number, newTotalSum]
        );

        res.status(201).json({
        id: insertResult.rows[0].id,
        number: insertResult.rows[0].number,
        total_sum: insertResult.rows[0].total_sum
        });
    } catch (err) {
        console.error('Error executing query', err.stack);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/total-sum', async (req, res) => {
    try {
      const result = await pool.query('SELECT total_sum FROM numbers ORDER BY id DESC LIMIT 1');
      const totalSum = result.rows.length > 0 ? result.rows[0].total_sum : 0;
      res.json({ totalSum });
    } catch (err) {
      console.error('Error fetching total sum', err.stack);
      res.status(500).send('Internal Server Error');
    }
  });
  
  app.get('/total-numbers', async (req, res) => {
    try {
      const result = await pool.query('SELECT COUNT(*) AS count FROM numbers');
      const totalNumbers = parseInt(result.rows[0].count, 10);
      res.json({ totalNumbers });
    } catch (err) {
      console.error('Error fetching total numbers', err.stack);
      res.status(500).send('Internal Server Error');
    }
  });
  
  app.get('/total-manual-sum', async (req, res) => {
    try {
      const result = await pool.query('SELECT number FROM numbers');
      const numbers = result.rows.map(row => row.number);
      const manualSum = numbers.reduce((acc, num) => acc + num, 0);
      res.json({ manualSum });
    } catch (err) {
      console.error('Error calculating manual sum', err.stack);
      res.status(500).send('Internal Server Error');
    }
  });
  

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
