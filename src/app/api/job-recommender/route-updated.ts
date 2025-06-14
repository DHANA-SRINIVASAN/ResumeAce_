import { NextRequest, NextResponse } from 'next/server';
import { getJobRecommendations, RecommendedJob } from '@/ai/flows/job-recommender-updated';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { resumeId, skills, experienceSummary, projectsSummary, targetRole } = body;

        if (!resumeId || !skills || skills.length === 0) {
            return NextResponse.json(
                { error: 'Resume ID and skills are required' },
                { status: 400 }
            );
        }

        // Check if resume exists
        const resume = await db.resume.findUnique({
            where: { id: resumeId },
        });

        if (!resume) {
            return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
        }

        // Get job recommendations from real job APIs
        const jobRecommendations = await getJobRecommendations({
            skills,
            experienceSummary: experienceSummary || '',
            projectsSummary,
            targetRole,
        });

        // Save job matches to database
        if (jobRecommendations.jobs && jobRecommendations.jobs.length > 0) {
            // Delete existing job matches for this resume
            await db.jobMatch.deleteMany({
                where: { resumeId },
            });

            // Create new job matches
            await Promise.all(
                jobRecommendations.jobs.map((job: RecommendedJob) =>
                    db.jobMatch.create({
                        data: {
                            resumeId,
                            jobData: job,
                        },
                    })
                )
            );
        }

        return NextResponse.json(jobRecommendations);
    } catch (error) {
        console.error('Error in job recommender API:', error);
        return NextResponse.json(
            { error: 'Failed to generate job recommendations' },
            { status: 500 }
        );
    }
}