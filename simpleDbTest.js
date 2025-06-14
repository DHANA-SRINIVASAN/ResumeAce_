console.log('Starting simple database test...');

const mysql = require('mysql2/promise');

async function testConnection() {
    console.log('Creating connection...');

    try {
        // Create connection
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',  // Replace with your MySQL username
            password: '',  // Replace with your MySQL password
            database: 'resumeace'
        });

        console.log('Connected to MySQL database!');

        // Test query
        console.log('Running test query...');
        const [rows] = await connection.execute('SELECT 1 + 1 AS result');
        console.log('Query result:', rows[0].result);

        // Close connection
        await connection.end();
        console.log('Connection closed');

    } catch (error) {
        console.error('Error connecting to MySQL:', error.message);
        console.error('Error code:', error.code);
        console.error('Error stack:', error.stack);
    }
}

// Run the test
testConnection().then(() => {
    console.log('Test completed');
}).catch(err => {
    console.error('Unhandled error:', err);
});