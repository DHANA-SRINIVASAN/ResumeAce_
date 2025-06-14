const fs = require('fs');
const mysql = require('mysql2/promise');
const path = require('path');

async function setupDatabase() {
    // Read SQL file
    const sqlFilePath = path.join(__dirname, 'setup.sql');
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');

    // Split SQL script into individual statements
    const statements = sqlScript
        .split(';')
        .filter(statement => statement.trim() !== '');

    // Create connection
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'admin',
        password: 'admin@123',
        multipleStatements: true
    });

    try {
        // Create database if it doesn't exist
        await connection.query('CREATE DATABASE IF NOT EXISTS resumeace');

        // Use the database
        await connection.query('USE resumeace');

        console.log('Connected to MySQL database');

        // Execute each statement
        for (const statement of statements) {
            const trimmedStatement = statement.trim();
            if (trimmedStatement) {
                console.log(`Executing: ${trimmedStatement.substring(0, 50)}...`);
                await connection.query(`${trimmedStatement};`);
            }
        }

        console.log('Database setup completed successfully');
    } catch (error) {
        console.error('Error setting up database:', error);
    } finally {
        await connection.end();
    }
}

setupDatabase();