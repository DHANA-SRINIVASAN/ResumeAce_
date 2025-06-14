import fetch from 'node-fetch';

// Set the base URL for the API
const API_BASE_URL = 'http://localhost:9004/api';

async function testAPI() {
    try {
        console.log('Testing API endpoints...\n');

        // Test GET /api/users
        console.log('1. Testing GET /api/users');
        const usersResponse = await fetch(`${API_BASE_URL}/users`);
        const users = await usersResponse.json();
        console.log(`   Status: ${usersResponse.status} ${usersResponse.statusText}`);
        console.log(`   Found ${users.length} users`);

        if (users.length > 0) {
            const userId = users[0].id;
            console.log(`   Using user ID: ${userId} for further tests\n`);

            // Test GET /api/resumes?userId=<userId>
            console.log('2. Testing GET /api/resumes?userId=<userId>');
            const userResumesResponse = await fetch(`${API_BASE_URL}/resumes?userId=${userId}`);
            const userResumes = await userResumesResponse.json();
            console.log(`   Status: ${userResumesResponse.status} ${userResumesResponse.statusText}`);
            console.log(`   Found ${userResumes.length} resumes for user\n`);

            if (userResumes.length > 0) {
                const resumeId = userResumes[0].id;
                console.log(`   Using resume ID: ${resumeId} for further tests\n`);

                // Test GET /api/resumes/[id]
                console.log('3. Testing GET /api/resumes/[id]');
                const resumeResponse = await fetch(`${API_BASE_URL}/resumes/${resumeId}`);
                const resume = await resumeResponse.json();
                console.log(`   Status: ${resumeResponse.status} ${resumeResponse.statusText}`);
                console.log(`   Resume title: ${resume.title}\n`);
            }

            // Test creating a new resume
            console.log('4. Testing POST /api/resumes');
            const newResumeResponse = await fetch(`${API_BASE_URL}/resumes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userId,
                    title: 'API Test Resume',
                    content: {
                        skills: ['API Testing', 'JavaScript', 'Node.js'],
                        experience: [
                            {
                                company: 'API Test Company',
                                role: 'API Tester',
                                startDate: '2023-01-01',
                                endDate: '2023-12-31',
                                description: 'Testing API endpoints',
                            },
                        ],
                        education: [
                            {
                                institution: 'API University',
                                degree: 'Bachelor of API',
                                field: 'API Science',
                                startDate: '2019-01-01',
                                endDate: '2023-01-01',
                            },
                        ],
                    },
                }),
            });
            const newResume = await newResumeResponse.json();
            console.log(`   Status: ${newResumeResponse.status} ${newResumeResponse.statusText}`);
            console.log(`   Created resume with ID: ${newResume.id}\n`);
        }

        console.log('API tests completed!');
    } catch (error) {
        console.error('Error testing API:', error);
        console.log('\nMake sure the development server is running on port 9004');
        console.log('You can start it with: npm run dev');
    }
}

testAPI();