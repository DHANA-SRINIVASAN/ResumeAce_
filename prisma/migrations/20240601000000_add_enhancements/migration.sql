-- AlterTable
ALTER TABLE `Resume` ADD COLUMN `anonymizedVersion` VARCHAR(191) NULL,
    ADD COLUMN `sentimentScore` DOUBLE NULL;

-- AlterTable
ALTER TABLE `JobMatch` ADD COLUMN `matchScore` INTEGER NULL;

-- CreateTable
CREATE TABLE `SkillGapAnalysis` (
    `id` VARCHAR(191) NOT NULL,
    `resumeId` VARCHAR(191) NOT NULL,
    `jobDescription` TEXT NOT NULL,
    `requiredSkills` JSON NOT NULL,
    `missingSkills` JSON NOT NULL,
    `recommendations` JSON NOT NULL,
    `matchPercentage` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `SkillGapAnalysis_resumeId_idx`(`resumeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `JobApplication` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `resumeId` VARCHAR(191) NOT NULL,
    `jobMatchId` VARCHAR(191) NULL,
    `jobTitle` VARCHAR(191) NOT NULL,
    `company` VARCHAR(191) NOT NULL,
    `applicationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` VARCHAR(191) NOT NULL,
    `notes` TEXT NULL,
    `nextSteps` VARCHAR(191) NULL,
    `interviewDate` DATETIME(3) NULL,

    INDEX `JobApplication_userId_idx`(`userId`),
    INDEX `JobApplication_resumeId_idx`(`resumeId`),
    INDEX `JobApplication_jobMatchId_idx`(`jobMatchId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SkillDevelopment` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `skill` VARCHAR(191) NOT NULL,
    `courses` JSON NOT NULL,
    `progress` INTEGER NOT NULL,
    `startDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `targetDate` DATETIME(3) NULL,
    `completed` BOOLEAN NOT NULL DEFAULT false,

    INDEX `SkillDevelopment_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserPreferences` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `privacySettings` JSON NOT NULL,
    `jobAlertFrequency` VARCHAR(191) NULL,
    `desiredLocations` JSON NULL,
    `remotePreference` VARCHAR(191) NULL,
    `salaryExpectations` JSON NULL,

    UNIQUE INDEX `UserPreferences_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LinkedAccount` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `providerUserId` VARCHAR(191) NOT NULL,
    `accessToken` VARCHAR(191) NULL,
    `refreshToken` VARCHAR(191) NULL,
    `expiresAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `LinkedAccount_provider_providerUserId_key`(`provider`, `providerUserId`),
    INDEX `LinkedAccount_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SkillGapAnalysis` ADD CONSTRAINT `SkillGapAnalysis_resumeId_fkey` FOREIGN KEY (`resumeId`) REFERENCES `Resume`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobApplication` ADD CONSTRAINT `JobApplication_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobApplication` ADD CONSTRAINT `JobApplication_resumeId_fkey` FOREIGN KEY (`resumeId`) REFERENCES `Resume`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobApplication` ADD CONSTRAINT `JobApplication_jobMatchId_fkey` FOREIGN KEY (`jobMatchId`) REFERENCES `JobMatch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SkillDevelopment` ADD CONSTRAINT `SkillDevelopment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserPreferences` ADD CONSTRAINT `UserPreferences_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LinkedAccount` ADD CONSTRAINT `LinkedAccount_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;