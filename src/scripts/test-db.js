import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    try {
        // Test database connection
        console.log('Testing database connection...');
        await prisma.$connect();
        console.log('Database connection successful!');

        // Create a test user
        const user = await prisma.user.create({
            data: {
                email: 'test2@example.com',
                name: 'Test User',
            },
        });
        console.log('Created test user:', user);

        // Create a test resume
        const resumeContent = {
            skills: ['JavaScript', 'React', 'Node.js'],
            experience: [
                {
                    company: 'Example Company',
                    role: 'Software Developer',
                    startDate: '2020-01-01',
                    endDate: '2022-01-01',
                    description: 'Worked on various projects',
                },
            ],
            education: [
                {
                    institution: 'Example University',
                    degree: 'Bachelor of Science',
                    field: 'Computer Science',
                    startDate: '2016-01-01',
                    endDate: '2020-01-01',
                },
            ],
        };

        const resume = await prisma.resume.create({
            data: {
                userId: user.id,
                title: 'Test Resume',
                content: resumeContent,
            },
        });
        console.log('Created test resume:', resume);

        // Save resume to file system manually
        const userName = user.name || 'unknown_user';
        const sanitizedUserName = userName.replace(/[^a-zA-Z0-9]/g, '_');
        const sanitizedResumeName = 'Test_Resume';

        // Create directory structure
        const userDir = path.join(process.cwd(), 'data', 'resumes', sanitizedUserName);

        // Ensure the directory exists
        fs.mkdirSync(userDir, { recursive: true });
        console.log(`Created directory: ${userDir}`);

        // Write the resume content to a file
        const filePath = path.join(userDir, `${sanitizedResumeName}.json`);
        fs.writeFileSync(filePath, JSON.stringify(resumeContent, null, 2));
        console.log(`Created resume file: ${filePath}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();