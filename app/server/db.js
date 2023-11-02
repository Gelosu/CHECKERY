const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});


async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to MySQL database.');
    connection.release();
  } catch (err) {
    console.error('Error connecting:', err);
  }
}

testConnection();

module.exports = pool;

