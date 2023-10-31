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

// Test the database connection
pool.getConnection()
  .then((connection) => {
    console.log('Connected to MySQL database.');
    connection.release(); 
  })
  .catch((err) => {
    console.error('Error connecting:', err);
  });

app.get('/checkDatabaseConnection', (req, res) => {
  pool.getConnection()
    .then((connection) => {
      connection.release();
      res.json({ connected: true });
    })
    .catch((err) => {
      console.error('Error checking the database connection:', err);
      res.json({ connected: false });
    });
});

module.exports = pool;
