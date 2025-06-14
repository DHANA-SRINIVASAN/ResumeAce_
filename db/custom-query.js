const mysql = require('mysql2/promise');

async function runCustomQuery() {
    // Create connection
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'admin',
        password: 'admin@123',
        database: 'resumeace'
    });

    try {
        console.log('Connected to MySQL database');

        // Example 1: Get all job matches with detailed information
        console.log('\n--- Example 1: Job Matches with Resume and Job Details ---');
        const [jobMatches] = await connection.query(`
      SELECT 
        jm.id, 
        jm.matchScore,
        r.title as resumeTitle,
        u.name as userName,
        JSON_EXTRACT(jm.jobData, '$.title') as jobTitle,
        JSON_EXTRACT(jm.jobData, '$.company') as company,
        JSON_EXTRACT(jm.jobData, '$.location') as location,
        jm.createdAt
      FROM JobMatch jm
      JOIN Resume r ON jm.resumeId = r.id
      JOIN User u ON r.userId = u.id
    `);
        console.table(jobMatches);

        // Example 2: Get skill gap analysis with resume details
        console.log('\n--- Example 2: Skill Gap Analysis with Resume Details ---');
        const [skillGaps] = await connection.query(`
      SELECT 
        sg.id,
        r.title as resumeTitle,
        u.name as userName,
        sg.jobDescription,
        sg.requiredSkills,
        sg.missingSkills,
        sg.recommendations,
        sg.matchPercentage
      FROM SkillGapAnalysis sg
      JOIN Resume r ON sg.resumeId = r.id
      JOIN User u ON r.userId = u.id
    `);
        console.table(skillGaps);

        // Example 3: Get user skills with proficiency levels (direct MySQL)
        console.log('\n--- Example 3: User Skills with Proficiency Levels ---');
        const [userSkills] = await connection.query(`
      SELECT 
        u.username,
        u.first_name,
        u.last_name,
        s.skill_name,
        us.proficiency_level
      FROM user_skills us
      JOIN users u ON us.user_id = u.user_id
      JOIN skills s ON us.skill_id = s.skill_id
      ORDER BY u.username, us.proficiency_level DESC
    `);
        console.table(userSkills);

        // Example 4: Get job listings with required skills (direct MySQL)
        console.log('\n--- Example 4: Job Listings with Required Skills ---');
        const [jobSkills] = await connection.query(`
      SELECT 
        j.title,
        j.company,
        j.location,
        s.skill_name,
        js.importance_level
      FROM job_skills js
      JOIN job_listings j ON js.job_id = j.job_id
      JOIN skills s ON js.skill_id = s.skill_id
      ORDER BY j.title, js.importance_level
    `);
        console.table(jobSkills);

        // Example 5: Get job match scores (direct MySQL)
        console.log('\n--- Example 5: Job Match Scores ---');
        const [matchScores] = await connection.query(`
      SELECT 
        u.username,
        u.first_name,
        u.last_name,
        j.title,
        j.company,
        jm.match_score
      FROM job_matches jm
      JOIN users u ON jm.user_id = u.user_id
      JOIN job_listings j ON jm.job_id = j.job_id
      ORDER BY jm.match_score DESC
    `);
        console.table(matchScores);

    } catch (error) {
        console.error('Error executing query:', error);
    } finally {
        await connection.end();
        console.log('\nDatabase connection closed');
    }
}

// Run the custom query function
runCustomQuery();