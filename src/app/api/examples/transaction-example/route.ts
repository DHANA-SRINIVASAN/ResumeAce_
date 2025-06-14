import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, resumeTitle, jobDescription } = body;

        // Use a transaction to ensure all operations succeed or fail together
        const result = await prisma.$transaction(async (tx) => {
            // Create a resume
            const resume = await tx.resume.create({
                data: {
                    userId,
                    title: resumeTitle,
                    content: { /* Resume content */ },
                },
            });

            // Create a job match for the resume
            const jobMatch = await tx.jobMatch.create({
                data: {
                    resumeId: resume.id,
                    jobData: { description: jobDescription },
                    matchScore: 85,
                },
            });

            // Create a skill gap analysis
            const skillGapAnalysis = await tx.skillGapAnalysis.create({
                data: {
                    resumeId: resume.id,
                    jobDescription,
                    requiredSkills: ["JavaScript", "React", "Node.js"],
                    missingSkills: ["Node.js"],
                    recommendations: { courses: ["Node.js Fundamentals"] },
                    matchPercentage: 75,
                },
            });

            return { resume, jobMatch, skillGapAnalysis };
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Transaction error:', error);
        return NextResponse.json(
            { error: 'An error occurred during the transaction' },
            { status: 500 }
        );
    }
}