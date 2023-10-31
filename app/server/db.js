const express = require('express');
const app = express();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: bzn5olpirsjaxyczya13-mysql.services.clever-cloud.com,
  user: ur9qdorhytfru6zr,
  password: 0SKn6yyEjjNfJ9DcSs4Q,
  database: bzn5olpirsjaxyczya13,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  port: 3306,
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


module.exports = pool;
