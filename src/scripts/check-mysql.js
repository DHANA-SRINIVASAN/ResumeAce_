import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Checking MySQL database connection...');

        // Test database connection
        await prisma.$connect();
        console.log('✅ Database connection successful!');

        // Check if users exist
        const userCount = await prisma.user.count();
        console.log(`Found ${userCount} users in the database.`);

        if (userCount > 0) {
            // List all users
            const users = await prisma.user.findMany();
            console.log('\nUsers in database:');
            users.forEach(user => {
                console.log(`- ID: ${user.id}, Name: ${user.name}, Email: ${user.email}`);
            });

            // Check resumes
            const resumeCount = await prisma.resume.count();
            console.log(`\nFound ${resumeCount} resumes in the database.`);

            if (resumeCount > 0) {
                // List all resumes with user info
                const resumes = await prisma.resume.findMany({
                    include: {
                        user: true
                    }
                });

                console.log('\nResumes in database:');
                resumes.forEach(resume => {
                    console.log(`- ID: ${resume.id}, Title: ${resume.title}, User: ${resume.user.name}`);
                    console.log(`  Created: ${resume.createdAt}`);
                    console.log(`  Skills: ${JSON.stringify(resume.content.skills)}`);
                });
            }
        } else {
            console.log('No users found. Run the test-db.js script to create test data.');
        }

    } catch (error) {
        console.error('❌ Error connecting to database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();