// src/utils/job-matching.ts

import type { RecommendedJob } from '@/ai/flows/job-recommender';

/**
 * Calculate the match score between a job and a candidate's skills
 * @param job The job to calculate the match score for
 * @param candidateSkills The candidate's skills
 * @returns A match score between 0 and 100
 */
export function calculateJobMatchScore(
    job: Partial<RecommendedJob>,
    candidateSkills: string[]
): number {
    if (!job.title || !candidateSkills.length) {
        return 0;
    }

    // Normalize all strings for better matching
    const normalizeString = (str: string): string =>
        str.toLowerCase().replace(/[^\w\s]/g, '');

    const normalizedJobTitle = normalizeString(job.title);
    const normalizedCandidateSkills = candidateSkills.map(normalizeString);

    // Extract potential skills from job title and description
    const jobTitleWords = normalizedJobTitle.split(/\s+/);
    const jobDescriptionWords = job.description
        ? normalizeString(job.description).split(/\s+/)
        : [];

    // Get job required skills
    const jobRequiredSkills = job.keyRequiredSkills
        ? job.keyRequiredSkills.map(normalizeString)
        : [];

    // Calculate skill matches
    let matchCount = 0;
    let totalSkillsToMatch = normalizedCandidateSkills.length;

    // Check each candidate skill against job title, description, and required skills
    normalizedCandidateSkills.forEach(skill => {
        // Direct skill match in required skills (highest weight)
        if (jobRequiredSkills.some(jobSkill => jobSkill.includes(skill) || skill.includes(jobSkill))) {
            matchCount += 1.5;
            return;
        }

        // Skill appears in job title (high weight)
        if (jobTitleWords.some(word => word.includes(skill) || skill.includes(word))) {
            matchCount += 1.0;
            return;
        }

        // Skill appears in job description (medium weight)
        if (jobDescriptionWords.some(word => word.includes(skill) || skill.includes(word))) {
            matchCount += 0.5;
            return;
        }
    });

    // Calculate final score (0-100)
    const rawScore = (matchCount / totalSkillsToMatch) * 100;

    // Ensure score is between 0 and 100
    return Math.min(Math.max(Math.round(rawScore), 0), 100);
}

/**
 * Analyze a job and enhance it with AI-based insights
 * @param job The job to analyze
 * @param candidateSkills The candidate's skills
 * @param candidateExperience The candidate's experience summary
 * @returns An enhanced job with AI-based insights
 */
export function enhanceJobWithAI(
    job: RecommendedJob,
    candidateSkills: string[],
    candidateExperience: string
): RecommendedJob {
    // Calculate a more accurate match score
    const matchScore = calculateJobMatchScore(job, candidateSkills);

    // Determine key required skills that match the candidate's skills
    const normalizedCandidateSkills = candidateSkills.map(skill =>
        skill.toLowerCase().replace(/[^\w\s]/g, '')
    );

    // Filter job required skills to highlight matches with candidate skills
    const matchedSkills = job.keyRequiredSkills.filter(skill =>
        normalizedCandidateSkills.some(candidateSkill =>
            candidateSkill.includes(skill.toLowerCase()) ||
            skill.toLowerCase().includes(candidateSkill)
        )
    );

    // Ensure we have at least some skills in the list
    const enhancedSkills = matchedSkills.length > 0
        ? matchedSkills
        : job.keyRequiredSkills;

    // Return enhanced job
    return {
        ...job,
        matchScore: matchScore,
        keyRequiredSkills: enhancedSkills,
    };
}

/**
 * Analyze and enhance a list of jobs with AI-based insights
 * @param jobs The jobs to analyze
 * @param candidateSkills The candidate's skills
 * @param candidateExperience The candidate's experience summary
 * @returns An enhanced list of jobs with AI-based insights
 */
export function analyzeAndEnhanceJobs(
    jobs: RecommendedJob[],
    candidateSkills: string[],
    candidateExperience: string
): RecommendedJob[] {
    // Enhance each job with AI-based insights
    const enhancedJobs = jobs.map(job =>
        enhanceJobWithAI(job, candidateSkills, candidateExperience)
    );

    // Sort jobs by match score (highest first)
    const sortedJobs = enhancedJobs.sort((a, b) => b.matchScore - a.matchScore);

    // Filter out jobs with match score below 30%
    const filteredJobs = sortedJobs.filter(job => job.matchScore >= 30);

    return filteredJobs;
}