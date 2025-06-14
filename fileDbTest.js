const fs = require('fs');
const mysql = require('mysql2/promise');

// Function to write to log file
function writeLog(message) {
    const logMessage = `${new Date().toISOString()}: ${message}\n`;
    fs.appendFileSync('db_test_log.txt', logMessage);
}

async function testConnection() {
    writeLog('Starting database test...');

    try {
        // Create connection
        writeLog('Creating connection...');
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',  // Replace with your MySQL username
            password: '',  // Replace with your MySQL password
            database: 'resumeace'
        });

        writeLog('Connected to MySQL database!');

        // Test query
        writeLog('Running test query...');
        const [rows] = await connection.execute('SELECT 1 + 1 AS result');
        writeLog(`Query result: ${rows[0].result}`);

        // Close connection
        await connection.end();
        writeLog('Connection closed');

    } catch (error) {
        writeLog(`Error connecting to MySQL: ${error.message}`);
        writeLog(`Error code: ${error.code}`);
        writeLog(`Error stack: ${error.stack}`);
    }
}

// Run the test
testConnection().then(() => {
    writeLog('Test completed');
}).catch(err => {
    writeLog(`Unhandled error: ${err}`);
});