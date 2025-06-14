const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Function to prompt for input
function prompt(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

async function insertData() {
    // Create connection
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'admin',
        password: 'admin@123',
        database: 'resumeace'
    });

    try {
        console.log('Connected to MySQL database');

        // Display menu
        console.log('\nWhat would you like to insert?');
        console.log('1. Add a new user');
        console.log('2. Add a new resume');
        console.log('3. Add a new job match');
        console.log('4. Add a new skill gap analysis');
        console.log('5. Add a new job application');
        console.log('6. Add a new skill (direct MySQL)');
        console.log('7. Add a new job listing (direct MySQL)');

        const choice = await prompt('\nEnter your choice (1-7): ');

        switch (choice) {
            case '1':
                // Add a new user
                const email = await prompt('Enter email: ');
                const name = await prompt('Enter name: ');
                const password = await prompt('Enter password: ');

                const userId = uuidv4();
                await connection.query(`
          INSERT INTO \`User\` (id, email, name, password, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, NOW(), NOW())
        `, [userId, email, name, password]);

                console.log(`\nUser added successfully with ID: ${userId}`);
                break;

            case '2':
                // Add a new resume
                // First, get available users
                const [users] = await connection.query('SELECT id, name, email FROM \`User\`');

                if (users.length === 0) {
                    console.log('No users found. Please add a user first.');
                    break;
                }

                console.log('\nAvailable users:');
                users.forEach((user, index) => {
                    console.log(`${index + 1}. ${user.name} (${user.email})`);
                });

                const userIndex = parseInt(await prompt('Select user (enter number): ')) - 1;

                if (userIndex < 0 || userIndex >= users.length) {
                    console.log('Invalid selection.');
                    break;
                }

                const selectedUserId = users[userIndex].id;
                const resumeTitle = await prompt('Enter resume title: ');

                // Create a sample resume content
                const resumeContent = {
                    personalInfo: {
                        name: users[userIndex].name,
                        email: users[userIndex].email,
                        phone: await prompt('Enter phone number: '),
                        address: await prompt('Enter address: ')
                    },
                    education: [
                        {
                            institution: await prompt('Enter education institution: '),
                            degree: await prompt('Enter degree: '),
                            date: await prompt('Enter education dates (e.g., 2015-2019): ')
                        }
                    ],
                    experience: [
                        {
                            company: await prompt('Enter company name: '),
                            position: await prompt('Enter position: '),
                            date: await prompt('Enter employment dates: '),
                            description: await prompt('Enter job description: ')
                        }
                    ],
                    skills: (await prompt('Enter skills (comma separated): ')).split(',').map(s => s.trim())
                };

                const resumeId = uuidv4();
                await connection.query(`
          INSERT INTO \`Resume\` (id, userId, title, content, createdAt, updatedAt, sentimentScore)
          VALUES (?, ?, ?, ?, NOW(), NOW(), ?)
        `, [resumeId, selectedUserId, resumeTitle, JSON.stringify(resumeContent), 0.8]);

                console.log(`\nResume added successfully with ID: ${resumeId}`);
                break;

            case '3':
                // Add a new job match
                // First, get available resumes
                const [resumes] = await connection.query(`
          SELECT r.id, r.title, u.name 
          FROM \`Resume\` r
          JOIN \`User\` u ON r.userId = u.id
        `);

                if (resumes.length === 0) {
                    console.log('No resumes found. Please add a resume first.');
                    break;
                }

                console.log('\nAvailable resumes:');
                resumes.forEach((resume, index) => {
                    console.log(`${index + 1}. ${resume.title} (${resume.name})`);
                });

                const resumeIndex = parseInt(await prompt('Select resume (enter number): ')) - 1;

                if (resumeIndex < 0 || resumeIndex >= resumes.length) {
                    console.log('Invalid selection.');
                    break;
                }

                const selectedResumeId = resumes[resumeIndex].id;

                // Create job data
                const jobTitle = await prompt('Enter job title: ');
                const company = await prompt('Enter company name: ');
                const location = await prompt('Enter job location: ');
                const description = await prompt('Enter job description: ');
                const requirements = (await prompt('Enter job requirements (comma separated): ')).split(',').map(s => s.trim());
                const salary = await prompt('Enter salary range: ');

                const jobData = {
                    title: jobTitle,
                    company: company,
                    location: location,
                    description: description,
                    requirements: requirements,
                    salary: salary
                };

                const matchScore = parseInt(await prompt('Enter match score (0-100): '));

                const jobMatchId = uuidv4();
                await connection.query(`
          INSERT INTO \`JobMatch\` (id, resumeId, jobData, matchScore, createdAt)
          VALUES (?, ?, ?, ?, NOW())
        `, [jobMatchId, selectedResumeId, JSON.stringify(jobData), matchScore]);

                console.log(`\nJob match added successfully with ID: ${jobMatchId}`);
                break;

            case '4':
                // Add a new skill gap analysis
                // First, get available resumes
                const [resumesForSkillGap] = await connection.query(`
          SELECT r.id, r.title, u.name 
          FROM \`Resume\` r
          JOIN \`User\` u ON r.userId = u.id
        `);

                if (resumesForSkillGap.length === 0) {
                    console.log('No resumes found. Please add a resume first.');
                    break;
                }

                console.log('\nAvailable resumes:');
                resumesForSkillGap.forEach((resume, index) => {
                    console.log(`${index + 1}. ${resume.title} (${resume.name})`);
                });

                const resumeIndexForSkillGap = parseInt(await prompt('Select resume (enter number): ')) - 1;

                if (resumeIndexForSkillGap < 0 || resumeIndexForSkillGap >= resumesForSkillGap.length) {
                    console.log('Invalid selection.');
                    break;
                }

                const selectedResumeIdForSkillGap = resumesForSkillGap[resumeIndexForSkillGap].id;

                const jobDescription = await prompt('Enter job description: ');
                const requiredSkills = (await prompt('Enter required skills (comma separated): ')).split(',').map(s => s.trim());
                const missingSkills = (await prompt('Enter missing skills (comma separated): ')).split(',').map(s => s.trim());
                const recommendations = (await prompt('Enter recommendations (comma separated): ')).split(',').map(s => s.trim());
                const matchPercentage = parseInt(await prompt('Enter match percentage (0-100): '));

                const skillGapId = uuidv4();
                await connection.query(`
          INSERT INTO \`SkillGapAnalysis\` (id, resumeId, jobDescription, requiredSkills, missingSkills, recommendations, matchPercentage, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        `, [skillGapId, selectedResumeIdForSkillGap, jobDescription, JSON.stringify(requiredSkills), JSON.stringify(missingSkills), JSON.stringify(recommendations), matchPercentage]);

                console.log(`\nSkill gap analysis added successfully with ID: ${skillGapId}`);
                break;

            case '5':
                // Add a new job application
                // First, get available users
                const [usersForJobApp] = await connection.query('SELECT id, name, email FROM \`User\`');

                if (usersForJobApp.length === 0) {
                    console.log('No users found. Please add a user first.');
                    break;
                }

                console.log('\nAvailable users:');
                usersForJobApp.forEach((user, index) => {
                    console.log(`${index + 1}. ${user.name} (${user.email})`);
                });

                const userIndexForJobApp = parseInt(await prompt('Select user (enter number): ')) - 1;

                if (userIndexForJobApp < 0 || userIndexForJobApp >= usersForJobApp.length) {
                    console.log('Invalid selection.');
                    break;
                }

                const selectedUserIdForJobApp = usersForJobApp[userIndexForJobApp].id;

                // Get resumes for this user
                const [resumesForJobApp] = await connection.query(`
          SELECT id, title FROM \`Resume\` WHERE userId = ?
        `, [selectedUserIdForJobApp]);

                if (resumesForJobApp.length === 0) {
                    console.log('No resumes found for this user. Please add a resume first.');
                    break;
                }

                console.log('\nAvailable resumes:');
                resumesForJobApp.forEach((resume, index) => {
                    console.log(`${index + 1}. ${resume.title}`);
                });

                const resumeIndexForJobApp = parseInt(await prompt('Select resume (enter number): ')) - 1;

                if (resumeIndexForJobApp < 0 || resumeIndexForJobApp >= resumesForJobApp.length) {
                    console.log('Invalid selection.');
                    break;
                }

                const selectedResumeIdForJobApp = resumesForJobApp[resumeIndexForJobApp].id;

                // Get job matches for this resume
                const [jobMatchesForJobApp] = await connection.query(`
          SELECT id, JSON_EXTRACT(jobData, '$.title') as title, JSON_EXTRACT(jobData, '$.company') as company
          FROM \`JobMatch\` WHERE resumeId = ?
        `, [selectedResumeIdForJobApp]);

                let selectedJobMatchIdForJobApp = null;

                if (jobMatchesForJobApp.length > 0) {
                    console.log('\nAvailable job matches:');
                    jobMatchesForJobApp.forEach((jobMatch, index) => {
                        console.log(`${index + 1}. ${jobMatch.title} at ${jobMatch.company}`);
                    });

                    const useJobMatch = await prompt('Use an existing job match? (y/n): ');

                    if (useJobMatch.toLowerCase() === 'y') {
                        const jobMatchIndexForJobApp = parseInt(await prompt('Select job match (enter number): ')) - 1;

                        if (jobMatchIndexForJobApp >= 0 && jobMatchIndexForJobApp < jobMatchesForJobApp.length) {
                            selectedJobMatchIdForJobApp = jobMatchesForJobApp[jobMatchIndexForJobApp].id;
                        }
                    }
                }

                const jobTitleForApp = await prompt('Enter job title: ');
                const companyForJobApp = await prompt('Enter company name: ');
                const status = await prompt('Enter application status: ');
                const notes = await prompt('Enter notes: ');
                const nextSteps = await prompt('Enter next steps: ');

                const jobApplicationId = uuidv4();
                await connection.query(`
          INSERT INTO \`JobApplication\` (id, userId, resumeId, jobMatchId, jobTitle, company, applicationDate, status, notes, nextSteps)
          VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?)
        `, [jobApplicationId, selectedUserIdForJobApp, selectedResumeIdForJobApp, selectedJobMatchIdForJobApp, jobTitleForApp, companyForJobApp, status, notes, nextSteps]);

                console.log(`\nJob application added successfully with ID: ${jobApplicationId}`);
                break;

            case '6':
                // Add a new skill (direct MySQL)
                const skillName = await prompt('Enter skill name: ');

                await connection.query(`
          INSERT INTO skills (skill_name) VALUES (?)
          ON DUPLICATE KEY UPDATE skill_name = VALUES(skill_name)
        `, [skillName]);

                console.log('\nSkill added successfully');
                break;

            case '7':
                // Add a new job listing (direct MySQL)
                const jobTitleDirect = await prompt('Enter job title: ');
                const companyDirect = await prompt('Enter company name: ');
                const locationDirect = await prompt('Enter job location: ');
                const descriptionDirect = await prompt('Enter job description: ');
                const requirementsDirect = await prompt('Enter job requirements: ');
                const salaryRangeDirect = await prompt('Enter salary range: ');
                const jobTypeDirect = await prompt('Enter job type (full-time, part-time, contract, freelance, internship): ');

                await connection.query(`
          INSERT INTO job_listings (title, company, location, description, requirements, salary_range, job_type)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [jobTitleDirect, companyDirect, locationDirect, descriptionDirect, requirementsDirect, salaryRangeDirect, jobTypeDirect]);

                console.log('\nJob listing added successfully');
                break;

            default:
                console.log('Invalid choice');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await connection.end();
        console.log('\nDatabase connection closed');
        rl.close();
    }
}

// Run the function
insertData();