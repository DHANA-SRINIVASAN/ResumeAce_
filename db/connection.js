const mysql = require('mysql2/promise');

// Create a connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'admin',  // Your MySQL username
  password: 'admin@123',  // Your MySQL password
  database: 'resumeace',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection
async function testConnection() {
  try {
    console.log('Attempting to connect to MySQL database...');
    const connection = await pool.getConnection();
    console.log('Connected to MySQL database successfully!');
    connection.release();
    return true;
  } catch (error) {
    console.error('Error connecting to the database:', error.message);
    console.error('Error code:', error.code);
    console.error('Error stack:', error.stack);
    return false;
  }
}

module.exports = {
  pool,
  testConnection
};