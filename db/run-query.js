const mysql = require('mysql2/promise');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function runQuery(query) {
    // Create connection
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'admin',
        password: 'admin@123',
        database: 'resumeace'
    });

    try {
        console.log('Connected to MySQL database');
        console.log(`Executing query: ${query}`);

        const [rows] = await connection.query(query);

        if (rows.length === 0) {
            console.log('No data found.');
        } else {
            console.table(rows);
            console.log(`Total records: ${rows.length}`);
        }
    } catch (error) {
        console.error('Error executing query:', error);
    } finally {
        await connection.end();
        console.log('Database connection closed');
        rl.close();
    }
}

// List of common queries
const commonQueries = [
    { id: 1, name: 'All Users', query: 'SELECT * FROM `User`' },
    { id: 2, name: 'All Resumes', query: 'SELECT * FROM `Resume`' },
    { id: 3, name: 'All Job Matches', query: 'SELECT * FROM `JobMatch`' },
    { id: 4, name: 'All Skill Gap Analyses', query: 'SELECT * FROM `SkillGapAnalysis`' },
    { id: 5, name: 'All Job Applications', query: 'SELECT * FROM `JobApplication`' },
    { id: 6, name: 'All users (direct MySQL)', query: 'SELECT * FROM users' },
    { id: 7, name: 'All skills (direct MySQL)', query: 'SELECT * FROM skills' },
    { id: 8, name: 'User skills with names (direct MySQL)', query: 'SELECT u.username, s.skill_name, us.proficiency_level FROM user_skills us JOIN users u ON us.user_id = u.user_id JOIN skills s ON us.skill_id = s.skill_id' },
    { id: 9, name: 'Job listings with skills (direct MySQL)', query: 'SELECT j.title, j.company, s.skill_name, js.importance_level FROM job_skills js JOIN job_listings j ON js.job_id = j.job_id JOIN skills s ON js.skill_id = s.skill_id' },
    { id: 10, name: 'Job matches with user and job details (direct MySQL)', query: 'SELECT u.username, j.title, j.company, jm.match_score FROM job_matches jm JOIN users u ON jm.user_id = u.user_id JOIN job_listings j ON jm.job_id = j.job_id' },
    { id: 11, name: 'Custom query', query: 'custom' }
];

// Display the list of common queries
console.log('Available queries:');
commonQueries.forEach(q => {
    console.log(`${q.id}. ${q.name}`);
});

// Ask the user to select a query
rl.question('\nEnter the number of the query you want to run (or 11 for custom query): ', (answer) => {
    const queryId = parseInt(answer);

    if (isNaN(queryId) || queryId < 1 || queryId > commonQueries.length) {
        console.log('Invalid selection. Please run the script again.');
        rl.close();
        return;
    }

    const selectedQuery = commonQueries.find(q => q.id === queryId);

    if (selectedQuery.query === 'custom') {
        rl.question('\nEnter your custom SQL query: ', (customQuery) => {
            runQuery(customQuery);
        });
    } else {
        runQuery(selectedQuery.query);
    }
});