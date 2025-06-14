const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupPrismaTables() {
    console.log('Setting up Prisma database tables...');

    // Create connection
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'admin',
        password: 'admin@123',
        multipleStatements: true
    });

    try {
        // Create database if it doesn't exist
        await connection.query('CREATE DATABASE IF NOT EXISTS resumeace');

        // Use the database
        await connection.query('USE resumeace');

        console.log('Connected to MySQL database');

        // Create User table
        await connection.query(`
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
    `);
        console.log('Created User table');

        // Create Resume table
        await connection.query(`
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
    `);
        console.log('Created Resume table');

        // Create JobMatch table
        await connection.query(`
      CREATE TABLE IF NOT EXISTS \`JobMatch\` (
        \`id\` VARCHAR(191) NOT NULL,
        \`resumeId\` VARCHAR(191) NOT NULL,
        \`jobData\` JSON NOT NULL,
        \`matchScore\` INTEGER NULL,
        \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`id\`),
        INDEX \`JobMatch_resumeId_idx\`(\`resumeId\`)
      );
    `);
        console.log('Created JobMatch table');

        // Create SkillGapAnalysis table
        await connection.query(`
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
    `);
        console.log('Created SkillGapAnalysis table');

        // Create JobApplication table
        await connection.query(`
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
    `);
        console.log('Created JobApplication table');

        // Add more tables as needed...

        // Add foreign key constraints
        await connection.query(`
      ALTER TABLE \`Resume\` ADD CONSTRAINT \`Resume_userId_fkey\` 
      FOREIGN KEY (\`userId\`) REFERENCES \`User\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE;
    `);

        await connection.query(`
      ALTER TABLE \`JobMatch\` ADD CONSTRAINT \`JobMatch_resumeId_fkey\` 
      FOREIGN KEY (\`resumeId\`) REFERENCES \`Resume\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE;
    `);

        await connection.query(`
      ALTER TABLE \`SkillGapAnalysis\` ADD CONSTRAINT \`SkillGapAnalysis_resumeId_fkey\` 
      FOREIGN KEY (\`resumeId\`) REFERENCES \`Resume\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE;
    `);

        await connection.query(`
      ALTER TABLE \`JobApplication\` ADD CONSTRAINT \`JobApplication_userId_fkey\` 
      FOREIGN KEY (\`userId\`) REFERENCES \`User\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE;
    `);

        await connection.query(`
      ALTER TABLE \`JobApplication\` ADD CONSTRAINT \`JobApplication_resumeId_fkey\` 
      FOREIGN KEY (\`resumeId\`) REFERENCES \`Resume\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE;
    `);

        await connection.query(`
      ALTER TABLE \`JobApplication\` ADD CONSTRAINT \`JobApplication_jobMatchId_fkey\` 
      FOREIGN KEY (\`jobMatchId\`) REFERENCES \`JobMatch\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE;
    `);

        console.log('Added foreign key constraints');
        console.log('Prisma database tables created successfully');
    } catch (error) {
        console.error('Error setting up Prisma database tables:', error);
    } finally {
        await connection.end();
    }
}

setupPrismaTables();