const express = require('express');
const app = express();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DBNAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.get('/checkDatabaseConnection', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    connection.release();
    res.json({ connected: true });
  } catch (error) {
    console.error('Error connecting:', error);
    res.json({ connected: false });
  }
});


module.exports = pool;
