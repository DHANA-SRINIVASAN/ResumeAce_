// src/api/livecareer-adapter.ts
'use client';

import { LiveCareerResumeParseResponse, LiveCareerJobMatchResponse } from './livecareer-api';
import { AnalyzeResumeOutput } from '@/ai/flows/resume-analyzer';
import { RecruiterMatchOutput } from '@/ai/flows/recruiter-matcher-flow';

/**
 * Converts LiveCareer resume parse response to the application's AnalyzeResumeOutput format
 * @param liveCareerResponse The response from LiveCareer API
 * @returns Formatted resume analysis data
 */
export function convertToResumeAnalysis(liveCareerResponse: LiveCareerResumeParseResponse): AnalyzeResumeOutput {
    // Extract education information
    const educationText = liveCareerResponse.education.map(edu =>
        `${edu.degree || ''} in ${edu.fieldOfStudy || ''} from ${edu.institution || ''} (${edu.startDate || ''} - ${edu.endDate || ''})`
    ).join('\n');

    // Extract experience information
    const experienceText = liveCareerResponse.experience.map(exp =>
        `${exp.title || ''} at ${exp.company || ''} (${exp.startDate || ''} - ${exp.endDate || ''})\n${exp.description || ''}`
    ).join('\n\n');

    return {
        name: liveCareerResponse.name || '',
        contactDetails: `Email: ${liveCareerResponse.email || ''}, Phone: ${liveCareerResponse.phone || ''}`,
        skills: liveCareerResponse.skills || [],
        education: educationText,
        experience: experienceText,
        projects: [], // LiveCareer might not provide projects directly
        language: 'English', // Default to English, LiveCareer might provide language detection
    };
}

/**
 * Converts LiveCareer job match response to the application's RecruiterMatchOutput format
 * @param liveCareerResponse The response from LiveCareer API
 * @param resumeAnalysis The resume analysis data
 * @returns Formatted job match data
 */
export function convertToJobMatch(
    liveCareerResponse: LiveCareerJobMatchResponse,
    resumeAnalysis: AnalyzeResumeOutput
): RecruiterMatchOutput {
    // Map the match score (assuming LiveCareer uses 0-100 scale, adjust if needed)
    const fitmentScore = liveCareerResponse.matchScore;

    // Determine assessment based on score
    let assessment = 'Needs Significant Improvement';
    if (fitmentScore >= 85) assessment = 'Excellent Fit';
    else if (fitmentScore >= 70) assessment = 'Good Fit';
    else if (fitmentScore >= 50) assessment = 'Fair Match';

    // Create course recommendations from LiveCareer data if available
    const courseRecommendations = liveCareerResponse.recommendations?.courses.map(course => ({
        title: course.title,
        platform: course.provider,
        description: `Recommended to improve skills in ${liveCareerResponse.recommendations.skills.join(', ')}`,
        url: course.url,
        focusArea: liveCareerResponse.recommendations.skills[0], // Use first skill as focus area
    })) || [];

    return {
        fitmentScore,
        assessment,
        reasoning: `The candidate's resume has a ${fitmentScore}% match with the job description. ${fitmentScore >= 70
                ? 'The candidate has most of the required skills and experience.'
                : 'The candidate is missing some key skills and experience required for this position.'
            }`,
        keyMatches: liveCareerResponse.matchDetails.skillsMatch.matched,
        keyMismatches: liveCareerResponse.matchDetails.skillsMatch.missing,
        jdSkillsAnalysis: {
            identifiedSkillsInJd: [...liveCareerResponse.matchDetails.skillsMatch.matched, ...liveCareerResponse.matchDetails.skillsMatch.missing],
            mandatorySkillsMet: liveCareerResponse.matchDetails.skillsMatch.matched,
            optionalSkillsMet: [],
            missingMandatorySkills: liveCareerResponse.matchDetails.skillsMatch.missing,
            missingOptionalSkills: [],
            additionalSkillsInResume: resumeAnalysis.skills.filter(skill =>
                !liveCareerResponse.matchDetails.skillsMatch.matched.includes(skill) &&
                !liveCareerResponse.matchDetails.skillsMatch.missing.includes(skill)
            ),
        },
        courseRecommendations: fitmentScore < 70 ? courseRecommendations : [],
    };
}