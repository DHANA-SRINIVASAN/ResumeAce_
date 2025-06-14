const mysql = require('mysql2/promise');

async function queryDatabase() {
    // Create connection
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'admin',
        password: 'admin@123',
        database: 'resumeace'
    });

    try {
        console.log('Connected to MySQL database');

        // Function to execute a query and display results
        async function executeQuery(query, tableName) {
            console.log(`\n--- ${tableName} Data ---`);
            const [rows] = await connection.query(query);

            if (rows.length === 0) {
                console.log(`No data found in ${tableName} table.`);
            } else {
                console.table(rows);
                console.log(`Total records: ${rows.length}`);
            }
            return rows;
        }

        // Query User table
        await executeQuery('SELECT * FROM `User`', 'User');

        // Query Resume table
        await executeQuery('SELECT * FROM `Resume`', 'Resume');

        // Query JobMatch table
        await executeQuery('SELECT * FROM `JobMatch`', 'JobMatch');

        // Query SkillGapAnalysis table
        await executeQuery('SELECT * FROM `SkillGapAnalysis`', 'SkillGapAnalysis');

        // Query JobApplication table
        await executeQuery('SELECT * FROM `JobApplication`', 'JobApplication');

        // Query the direct MySQL tables
        console.log('\n--- Direct MySQL Connection Tables ---');

        // Query users table
        await executeQuery('SELECT * FROM users', 'users');

        // Query skills table
        await executeQuery('SELECT * FROM skills', 'skills');

        // Query user_skills table
        await executeQuery('SELECT * FROM user_skills', 'user_skills');

        // Query job_listings table
        await executeQuery('SELECT * FROM job_listings', 'job_listings');

        // Query job_skills table
        await executeQuery('SELECT * FROM job_skills', 'job_skills');

        // Query job_matches table
        await executeQuery('SELECT * FROM job_matches', 'job_matches');

    } catch (error) {
        console.error('Error querying database:', error);
    } finally {
        await connection.end();
        console.log('\nDatabase connection closed');
    }
}

// Run the query function
queryDatabase();