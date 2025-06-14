const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');

async function insertSampleData() {
    // Create connection
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'admin',
        password: 'admin@123',
        database: 'resumeace'
    });

    try {
        console.log('Connected to MySQL database');

        // Insert sample user
        const userId = uuidv4();
        await connection.query(`
      INSERT INTO \`User\` (id, email, name, password, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, NOW(), NOW())
    `, [userId, 'john.doe@example.com', 'John Doe', 'hashed_password']);
        console.log('Inserted sample user');

        // Insert sample resume
        const resumeId = uuidv4();
        const resumeContent = JSON.stringify({
            personalInfo: {
                name: 'John Doe',
                email: 'john.doe@example.com',
                phone: '123-456-7890',
                address: '123 Main St, Anytown, USA'
            },
            education: [
                {
                    institution: 'University of Example',
                    degree: 'Bachelor of Science in Computer Science',
                    date: '2015-2019'
                }
            ],
            experience: [
                {
                    company: 'Tech Company Inc.',
                    position: 'Software Developer',
                    date: '2019-Present',
                    description: 'Developed web applications using React and Node.js'
                },
                {
                    company: 'Startup LLC',
                    position: 'Junior Developer',
                    date: '2018-2019',
                    description: 'Assisted in building mobile applications'
                }
            ],
            skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL']
        });

        await connection.query(`
      INSERT INTO \`Resume\` (id, userId, title, content, createdAt, updatedAt, sentimentScore)
      VALUES (?, ?, ?, ?, NOW(), NOW(), ?)
    `, [resumeId, userId, 'My Professional Resume', resumeContent, 0.85]);
        console.log('Inserted sample resume');

        // Insert sample job match
        const jobMatchId = uuidv4();
        const jobData = JSON.stringify({
            title: 'Senior Software Developer',
            company: 'Enterprise Solutions Inc.',
            location: 'San Francisco, CA',
            description: 'Looking for an experienced developer with React and Node.js skills',
            requirements: ['5+ years experience', 'React', 'Node.js', 'AWS', 'CI/CD'],
            salary: '$120,000 - $150,000'
        });

        await connection.query(`
      INSERT INTO \`JobMatch\` (id, resumeId, jobData, matchScore, createdAt)
      VALUES (?, ?, ?, ?, NOW())
    `, [jobMatchId, resumeId, jobData, 85]);
        console.log('Inserted sample job match');

        // Insert sample skill gap analysis
        const skillGapId = uuidv4();
        const requiredSkills = JSON.stringify(['React', 'Node.js', 'AWS', 'Docker', 'Kubernetes', 'CI/CD']);
        const missingSkills = JSON.stringify(['AWS', 'Docker', 'Kubernetes', 'CI/CD']);
        const recommendations = JSON.stringify([
            'Take an AWS certification course',
            'Learn Docker containerization',
            'Practice Kubernetes deployments',
            'Set up a CI/CD pipeline for a personal project'
        ]);

        await connection.query(`
      INSERT INTO \`SkillGapAnalysis\` (id, resumeId, jobDescription, requiredSkills, missingSkills, recommendations, matchPercentage, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `, [skillGapId, resumeId, 'Senior Software Developer position requiring cloud and DevOps skills', requiredSkills, missingSkills, recommendations, 65]);
        console.log('Inserted sample skill gap analysis');

        // Insert sample job application
        const jobApplicationId = uuidv4();
        await connection.query(`
      INSERT INTO \`JobApplication\` (id, userId, resumeId, jobMatchId, jobTitle, company, applicationDate, status, notes, nextSteps)
      VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?)
    `, [jobApplicationId, userId, resumeId, jobMatchId, 'Senior Software Developer', 'Enterprise Solutions Inc.', 'Applied', 'Submitted application through company website', 'Follow up in one week']);
        console.log('Inserted sample job application');

        // Insert sample data into direct MySQL tables
        // Insert skills
        await connection.query(`
      INSERT INTO skills (skill_name) VALUES 
      ('JavaScript'), ('React'), ('Node.js'), ('Python'), ('SQL'), ('AWS'), ('Docker')
      ON DUPLICATE KEY UPDATE skill_name = VALUES(skill_name)
    `);
        console.log('Inserted sample skills');

        // Insert user in users table
        await connection.query(`
      INSERT INTO users (username, email, password, first_name, last_name) 
      VALUES ('johndoe', 'john.doe@example.com', 'hashed_password', 'John', 'Doe')
      ON DUPLICATE KEY UPDATE email = VALUES(email)
    `);
        console.log('Inserted sample user in users table');

        // Get the user_id
        const [userRows] = await connection.query('SELECT user_id FROM users WHERE username = ?', ['johndoe']);
        const directUserId = userRows[0]?.user_id;

        if (directUserId) {
            // Insert user skills
            const [skillRows] = await connection.query('SELECT skill_id, skill_name FROM skills');
            const skillMap = {};
            skillRows.forEach(row => {
                skillMap[row.skill_name] = row.skill_id;
            });

            const userSkills = ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'];
            const proficiencyLevels = ['basic', 'advanced', 'expert', 'intermediate', 'advanced'];

            for (let i = 0; i < userSkills.length; i++) {
                const skillId = skillMap[userSkills[i]];
                if (skillId) {
                    await connection.query(`
            INSERT INTO user_skills (user_id, skill_id, proficiency_level)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE proficiency_level = VALUES(proficiency_level)
          `, [directUserId, skillId, proficiencyLevels[i]]);
                }
            }
            console.log('Inserted sample user skills');

            // Insert job listing
            await connection.query(`
        INSERT INTO job_listings (title, company, location, description, requirements, salary_range, job_type)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
                'Senior Software Developer',
                'Enterprise Solutions Inc.',
                'San Francisco, CA',
                'Looking for an experienced developer with React and Node.js skills',
                'Minimum 5 years of experience with web development technologies',
                '$120,000 - $150,000',
                'full-time'
            ]);
            console.log('Inserted sample job listing');

            // Get the job_id
            const [jobRows] = await connection.query('SELECT job_id FROM job_listings WHERE title = ? AND company = ?', ['Senior Software Developer', 'Enterprise Solutions Inc.']);
            const jobId = jobRows[0]?.job_id;

            if (jobId) {
                // Insert job skills
                const jobSkills = ['JavaScript', 'React', 'Node.js', 'AWS', 'Docker'];
                const importanceLevels = ['required', 'required', 'required', 'preferred', 'nice-to-have'];

                for (let i = 0; i < jobSkills.length; i++) {
                    const skillId = skillMap[jobSkills[i]];
                    if (skillId) {
                        await connection.query(`
              INSERT INTO job_skills (job_id, skill_id, importance_level)
              VALUES (?, ?, ?)
              ON DUPLICATE KEY UPDATE importance_level = VALUES(importance_level)
            `, [jobId, skillId, importanceLevels[i]]);
                    }
                }
                console.log('Inserted sample job skills');

                // Insert job match
                await connection.query(`
          INSERT INTO job_matches (user_id, job_id, match_score)
          VALUES (?, ?, ?)
          ON DUPLICATE KEY UPDATE match_score = VALUES(match_score)
        `, [directUserId, jobId, 85.5]);
                console.log('Inserted sample job match in job_matches table');
            }
        }

        console.log('Sample data insertion completed successfully');

    } catch (error) {
        console.error('Error inserting sample data:', error);
    } finally {
        await connection.end();
        console.log('Database connection closed');
    }
}

// Run the function to insert sample data
insertSampleData();