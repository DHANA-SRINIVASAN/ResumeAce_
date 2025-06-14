const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Setting up Prisma database tables...');

    try {
        // Create User table
        await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS \`User\` (
        \`id\` VARCHAR(191) NOT NULL,
        \`email\` VARCHAR(191) NOT NULL,
        \`name\` VARCHAR(191) NULL,
        \`password\` VARCHAR(191) NULL,
        \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updatedAt\` DATETIME(3) NOT NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE INDEX \`User_email_key\`(\`email\`)
      );
    `;

        // Create Resume table
        await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS \`Resume\` (
        \`id\` VARCHAR(191) NOT NULL,
        \`userId\` VARCHAR(191) NOT NULL,
        \`title\` VARCHAR(191) NOT NULL,
        \`content\` JSON NOT NULL,
        \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updatedAt\` DATETIME(3) NOT NULL,
        \`anonymizedVersion\` VARCHAR(191) NULL,
        \`sentimentScore\` DOUBLE NULL,
        PRIMARY KEY (\`id\`),
        INDEX \`Resume_userId_idx\`(\`userId\`)
      );
    `;

        // Create JobMatch table
        await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS \`JobMatch\` (
        \`id\` VARCHAR(191) NOT NULL,
        \`resumeId\` VARCHAR(191) NOT NULL,
        \`jobData\` JSON NOT NULL,
        \`matchScore\` INTEGER NULL,
        \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`id\`),
        INDEX \`JobMatch_resumeId_idx\`(\`resumeId\`)
      );
    `;

        // Create SkillGapAnalysis table
        await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS \`SkillGapAnalysis\` (
        \`id\` VARCHAR(191) NOT NULL,
        \`resumeId\` VARCHAR(191) NOT NULL,
        \`jobDescription\` TEXT NOT NULL,
        \`requiredSkills\` JSON NOT NULL,
        \`missingSkills\` JSON NOT NULL,
        \`recommendations\` JSON NOT NULL,
        \`matchPercentage\` INTEGER NOT NULL,
        \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        INDEX \`SkillGapAnalysis_resumeId_idx\`(\`resumeId\`),
        PRIMARY KEY (\`id\`)
      );
    `;

        // Create JobApplication table
        await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS \`JobApplication\` (
        \`id\` VARCHAR(191) NOT NULL,
        \`userId\` VARCHAR(191) NOT NULL,
        \`resumeId\` VARCHAR(191) NOT NULL,
        \`jobMatchId\` VARCHAR(191) NULL,
        \`jobTitle\` VARCHAR(191) NOT NULL,
        \`company\` VARCHAR(191) NOT NULL,
        \`applicationDate\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`status\` VARCHAR(191) NOT NULL,
        \`notes\` TEXT NULL,
        \`nextSteps\` VARCHAR(191) NULL,
        \`interviewDate\` DATETIME(3) NULL,
        INDEX \`JobApplication_userId_idx\`(\`userId\`),
        INDEX \`JobApplication_resumeId_idx\`(\`resumeId\`),
        INDEX \`JobApplication_jobMatchId_idx\`(\`jobMatchId\`),
        PRIMARY KEY (\`id\`)
      );
    `;

        // Create SkillDevelopment table
        await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS \`SkillDevelopment\` (
        \`id\` VARCHAR(191) NOT NULL,
        \`userId\` VARCHAR(191) NOT NULL,
        \`skill\` VARCHAR(191) NOT NULL,
        \`courses\` JSON NOT NULL,
        \`progress\` INTEGER NOT NULL,
        \`startDate\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`targetDate\` DATETIME(3) NULL,
        \`completed\` BOOLEAN NOT NULL DEFAULT false,
        INDEX \`SkillDevelopment_userId_idx\`(\`userId\`),
        PRIMARY KEY (\`id\`)
      );
    `;

        // Create UserPreferences table
        await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS \`UserPreferences\` (
        \`id\` VARCHAR(191) NOT NULL,
        \`userId\` VARCHAR(191) NOT NULL,
        \`privacySettings\` JSON NOT NULL,
        \`jobAlertFrequency\` VARCHAR(191) NULL,
        \`desiredLocations\` JSON NULL,
        \`remotePreference\` VARCHAR(191) NULL,
        \`salaryExpectations\` JSON NULL,
        UNIQUE INDEX \`UserPreferences_userId_key\`(\`userId\`),
        PRIMARY KEY (\`id\`)
      );
    `;

        // Create LinkedAccount table
        await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS \`LinkedAccount\` (
        \`id\` VARCHAR(191) NOT NULL,
        \`userId\` VARCHAR(191) NOT NULL,
        \`provider\` VARCHAR(191) NOT NULL,
        \`providerUserId\` VARCHAR(191) NOT NULL,
        \`accessToken\` VARCHAR(191) NULL,
        \`refreshToken\` VARCHAR(191) NULL,
        \`expiresAt\` DATETIME(3) NULL,
        \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updatedAt\` DATETIME(3) NOT NULL,
        UNIQUE INDEX \`LinkedAccount_provider_providerUserId_key\`(\`provider\`, \`providerUserId\`),
        INDEX \`LinkedAccount_userId_idx\`(\`userId\`),
        PRIMARY KEY (\`id\`)
      );
    `;

        // Create PasswordReset table
        await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS \`PasswordReset\` (
        \`id\` VARCHAR(191) NOT NULL,
        \`userId\` VARCHAR(191) NOT NULL,
        \`token\` VARCHAR(191) NOT NULL,
        \`expiresAt\` DATETIME(3) NOT NULL,
        \`used\` BOOLEAN NOT NULL DEFAULT false,
        \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        UNIQUE INDEX \`PasswordReset_token_key\`(\`token\`),
        INDEX \`PasswordReset_userId_idx\`(\`userId\`),
        INDEX \`PasswordReset_token_idx\`(\`token\`),
        PRIMARY KEY (\`id\`)
      );
    `;

        // Create Candidate table
        await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS \`Candidate\` (
        \`id\` VARCHAR(191) NOT NULL,
        \`name\` VARCHAR(191) NOT NULL,
        \`email\` VARCHAR(191) NULL,
        \`phone\` VARCHAR(191) NULL,
        \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updatedAt\` DATETIME(3) NOT NULL,
        \`userId\` VARCHAR(191) NOT NULL,
        INDEX \`Candidate_userId_idx\`(\`userId\`),
        PRIMARY KEY (\`id\`)
      );
    `;

        // Create CandidateResume table
        await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS \`CandidateResume\` (
        \`id\` VARCHAR(191) NOT NULL,
        \`title\` VARCHAR(191) NOT NULL,
        \`fileName\` VARCHAR(191) NOT NULL,
        \`fileType\` VARCHAR(191) NOT NULL,
        \`fileSize\` INTEGER NOT NULL,
        \`fileUrl\` VARCHAR(191) NOT NULL,
        \`content\` TEXT NULL,
        \`parsedData\` JSON NULL,
        \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updatedAt\` DATETIME(3) NOT NULL,
        \`candidateId\` VARCHAR(191) NOT NULL,
        INDEX \`CandidateResume_candidateId_idx\`(\`candidateId\`),
        PRIMARY KEY (\`id\`)
      );
    `;

        // Create CandidateResumeAnalysis table
        await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS \`CandidateResumeAnalysis\` (
        \`id\` VARCHAR(191) NOT NULL,
        \`skills\` JSON NULL,
        \`experience\` JSON NULL,
        \`education\` JSON NULL,
        \`summary\` TEXT NULL,
        \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updatedAt\` DATETIME(3) NOT NULL,
        \`resumeId\` VARCHAR(191) NOT NULL,
        UNIQUE INDEX \`CandidateResumeAnalysis_resumeId_key\`(\`resumeId\`),
        PRIMARY KEY (\`id\`)
      );
    `;

        // Create JobPosting table
        await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS \`JobPosting\` (
        \`id\` VARCHAR(191) NOT NULL,
        \`title\` VARCHAR(191) NOT NULL,
        \`description\` TEXT NOT NULL,
        \`company\` VARCHAR(191) NULL,
        \`location\` VARCHAR(191) NULL,
        \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updatedAt\` DATETIME(3) NOT NULL,
        \`userId\` VARCHAR(191) NOT NULL,
        INDEX \`JobPosting_userId_idx\`(\`userId\`),
        PRIMARY KEY (\`id\`)
      );
    `;

        // Create CandidateJobMatch table
        await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS \`CandidateJobMatch\` (
        \`id\` VARCHAR(191) NOT NULL,
        \`score\` INTEGER NOT NULL,
        \`assessment\` VARCHAR(191) NULL,
        \`keyMatches\` JSON NULL,
        \`keyMismatches\` JSON NULL,
        \`feedback\` TEXT NULL,
        \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updatedAt\` DATETIME(3) NOT NULL,
        \`resumeId\` VARCHAR(191) NOT NULL,
        \`candidateId\` VARCHAR(191) NOT NULL,
        \`jobPostingId\` VARCHAR(191) NOT NULL,
        INDEX \`CandidateJobMatch_resumeId_idx\`(\`resumeId\`),
        INDEX \`CandidateJobMatch_candidateId_idx\`(\`candidateId\`),
        INDEX \`CandidateJobMatch_jobPostingId_idx\`(\`jobPostingId\`),
        PRIMARY KEY (\`id\`)
      );
    `;

        // Create CandidateTag table
        await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS \`CandidateTag\` (
        \`id\` VARCHAR(191) NOT NULL,
        \`name\` VARCHAR(191) NOT NULL,
        \`color\` VARCHAR(191) NULL,
        \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updatedAt\` DATETIME(3) NOT NULL,
        \`candidateId\` VARCHAR(191) NOT NULL,
        UNIQUE INDEX \`CandidateTag_candidateId_name_key\`(\`candidateId\`, \`name\`),
        INDEX \`CandidateTag_candidateId_idx\`(\`candidateId\`),
        PRIMARY KEY (\`id\`)
      );
    `;

        // Create CandidateNote table
        await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS \`CandidateNote\` (
        \`id\` VARCHAR(191) NOT NULL,
        \`content\` TEXT NOT NULL,
        \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updatedAt\` DATETIME(3) NOT NULL,
        \`candidateId\` VARCHAR(191) NOT NULL,
        INDEX \`CandidateNote_candidateId_idx\`(\`candidateId\`),
        PRIMARY KEY (\`id\`)
      );
    `;

        // Add foreign key constraints
        await prisma.$executeRaw`
      ALTER TABLE \`Resume\` ADD CONSTRAINT \`Resume_userId_fkey\` 
      FOREIGN KEY (\`userId\`) REFERENCES \`User\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE;
    `;

        await prisma.$executeRaw`
      ALTER TABLE \`JobMatch\` ADD CONSTRAINT \`JobMatch_resumeId_fkey\` 
      FOREIGN KEY (\`resumeId\`) REFERENCES \`Resume\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE;
    `;

        await prisma.$executeRaw`
      ALTER TABLE \`SkillGapAnalysis\` ADD CONSTRAINT \`SkillGapAnalysis_resumeId_fkey\` 
      FOREIGN KEY (\`resumeId\`) REFERENCES \`Resume\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE;
    `;

        await prisma.$executeRaw`
      ALTER TABLE \`JobApplication\` ADD CONSTRAINT \`JobApplication_userId_fkey\` 
      FOREIGN KEY (\`userId\`) REFERENCES \`User\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE;
    `;

        await prisma.$executeRaw`
      ALTER TABLE \`JobApplication\` ADD CONSTRAINT \`JobApplication_resumeId_fkey\` 
      FOREIGN KEY (\`resumeId\`) REFERENCES \`Resume\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE;
    `;

        await prisma.$executeRaw`
      ALTER TABLE \`JobApplication\` ADD CONSTRAINT \`JobApplication_jobMatchId_fkey\` 
      FOREIGN KEY (\`jobMatchId\`) REFERENCES \`JobMatch\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE;
    `;

        await prisma.$executeRaw`
      ALTER TABLE \`SkillDevelopment\` ADD CONSTRAINT \`SkillDevelopment_userId_fkey\` 
      FOREIGN KEY (\`userId\`) REFERENCES \`User\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE;
    `;

        await prisma.$executeRaw`
      ALTER TABLE \`UserPreferences\` ADD CONSTRAINT \`UserPreferences_userId_fkey\` 
      FOREIGN KEY (\`userId\`) REFERENCES \`User\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE;
    `;

        await prisma.$executeRaw`
      ALTER TABLE \`LinkedAccount\` ADD CONSTRAINT \`LinkedAccount_userId_fkey\` 
      FOREIGN KEY (\`userId\`) REFERENCES \`User\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE;
    `;

        await prisma.$executeRaw`
      ALTER TABLE \`PasswordReset\` ADD CONSTRAINT \`PasswordReset_userId_fkey\` 
      FOREIGN KEY (\`userId\`) REFERENCES \`User\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE;
    `;

        await prisma.$executeRaw`
      ALTER TABLE \`Candidate\` ADD CONSTRAINT \`Candidate_userId_fkey\` 
      FOREIGN KEY (\`userId\`) REFERENCES \`User\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE;
    `;

        await prisma.$executeRaw`
      ALTER TABLE \`CandidateResume\` ADD CONSTRAINT \`CandidateResume_candidateId_fkey\` 
      FOREIGN KEY (\`candidateId\`) REFERENCES \`Candidate\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE;
    `;

        await prisma.$executeRaw`
      ALTER TABLE \`CandidateResumeAnalysis\` ADD CONSTRAINT \`CandidateResumeAnalysis_resumeId_fkey\` 
      FOREIGN KEY (\`resumeId\`) REFERENCES \`CandidateResume\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE;
    `;

        await prisma.$executeRaw`
      ALTER TABLE \`JobPosting\` ADD CONSTRAINT \`JobPosting_userId_fkey\` 
      FOREIGN KEY (\`userId\`) REFERENCES \`User\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE;
    `;

        await prisma.$executeRaw`
      ALTER TABLE \`CandidateJobMatch\` ADD CONSTRAINT \`CandidateJobMatch_resumeId_fkey\` 
      FOREIGN KEY (\`resumeId\`) REFERENCES \`CandidateResume\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE;
    `;

        await prisma.$executeRaw`
      ALTER TABLE \`CandidateJobMatch\` ADD CONSTRAINT \`CandidateJobMatch_candidateId_fkey\` 
      FOREIGN KEY (\`candidateId\`) REFERENCES \`Candidate\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE;
    `;

        await prisma.$executeRaw`
      ALTER TABLE \`CandidateJobMatch\` ADD CONSTRAINT \`CandidateJobMatch_jobPostingId_fkey\` 
      FOREIGN KEY (\`jobPostingId\`) REFERENCES \`JobPosting\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE;
    `;

        await prisma.$executeRaw`
      ALTER TABLE \`CandidateTag\` ADD CONSTRAINT \`CandidateTag_candidateId_fkey\` 
      FOREIGN KEY (\`candidateId\`) REFERENCES \`Candidate\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE;
    `;

        await prisma.$executeRaw`
      ALTER TABLE \`CandidateNote\` ADD CONSTRAINT \`CandidateNote_candidateId_fkey\` 
      FOREIGN KEY (\`candidateId\`) REFERENCES \`Candidate\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE;
    `;

        console.log('Prisma database tables created successfully');
    } catch (error) {
        console.error('Error setting up Prisma database tables:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();