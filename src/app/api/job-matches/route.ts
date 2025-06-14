import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const resumeId = url.searchParams.get('resumeId');

        if (!resumeId) {
            return NextResponse.json({ error: 'Resume ID is required' }, { status: 400 });
        }

        const jobMatches = await db.jobMatch.findMany({
            where: { resumeId },
        });

        return NextResponse.json(jobMatches);
    } catch (error) {
        console.error('Error fetching job matches:', error);
        return NextResponse.json({ error: 'Failed to fetch job matches' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { resumeId, jobs } = body;

        if (!resumeId || !jobs || !Array.isArray(jobs)) {
            return NextResponse.json({ error: 'Resume ID and jobs array are required' }, { status: 400 });
        }

        // Create job matches
        const createdJobs = await Promise.all(
            jobs.map(job =>
                db.jobMatch.create({
                    data: {
                        resumeId,
                        jobData: job,
                    },
                })
            )
        );

        return NextResponse.json(createdJobs);
    } catch (error) {
        console.error('Error creating job matches:', error);
        return NextResponse.json({ error: 'Failed to create job matches' }, { status: 500 });
    }
}