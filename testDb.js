console.log('Starting database test script...');

let testConnection, userModel, jobModel, matchModel;

try {
    console.log('Loading database modules...');
    const connection = require('./db/connection');
    testConnection = connection.testConnection;
    userModel = require('./db/userModel');
    jobModel = require('./db/jobModel');
    matchModel = require('./db/matchModel');
    console.log('Database modules loaded successfully');
} catch (error) {
    console.error('Error loading database modules:', error);
    process.exit(1);
}

async function testDatabase() {
    try {
        // Test connection
        const connected = await testConnection();
        if (!connected) {
            console.error('Failed to connect to the database. Please check your connection settings.');
            return;
        }

        console.log('Testing database operations...');

        // Test user creation
        const userData = {
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123', // In a real app, this should be hashed
            firstName: 'Test',
            lastName: 'User',
            resumePath: '/uploads/resumes/test_resume.pdf'
        };

        // Create user
        const user = await userModel.createUser(userData);
        console.log('Created user:', user);

        // Store user skills
        const userSkills = [
            { name: 'JavaScript', proficiency: 'advanced' },
            { name: 'React', proficiency: 'intermediate' },
            { name: 'Node.js', proficiency: 'intermediate' },
            { name: 'MySQL', proficiency: 'basic' }
        ];
        await userModel.storeUserSkills(user.id, userSkills);
        console.log('Stored user skills');

        // Test job creation
        const jobData = {
            title: 'Frontend Developer',
            company: 'Tech Company',
            location: 'Remote',
            description: 'We are looking for a skilled frontend developer...',
            requirements: 'Experience with React, JavaScript, and CSS',
            salaryRange: '$80,000 - $100,000',
            jobType: 'Full-time',
            postedDate: new Date()
        };

        // Create job
        const job = await jobModel.createJobListing(jobData);
        console.log('Created job:', job);

        // Store job skills
        const jobSkills = [
            { name: 'JavaScript', importance: 'required' },
            { name: 'React', importance: 'required' },
            { name: 'CSS', importance: 'required' },
            { name: 'TypeScript', importance: 'preferred' },
            { name: 'Node.js', importance: 'preferred' }
        ];
        await jobModel.storeJobSkills(job.id, jobSkills);
        console.log('Stored job skills');

        // Calculate match score
        const matchScore = await matchModel.calculateMatchScore(user.id, job.id);
        console.log(`Match score between user ${user.id} and job ${job.id}: ${matchScore}%`);

        // Store match
        await matchModel.createJobMatch(user.id, job.id, matchScore);
        console.log('Stored job match');

        // Get user matches
        const userMatches = await matchModel.getUserMatches(user.id);
        console.log('User matches:', userMatches);

        console.log('All database operations completed successfully!');
    } catch (error) {
        console.error('Error during database testing:', error);
    }
}

testDatabase();