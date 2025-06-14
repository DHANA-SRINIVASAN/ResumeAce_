// src/app/api/job-matches/batch/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { matchResumeToJd, type RecruiterMatchInput, type RecruiterMatchOutput } from '@/ai/flows/recruiter-matcher-flow';
import { fileToDataUri } from '@/lib/file-utils';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { resumeIds, jobDescription, userId } = body;

    if (!resumeIds || !Array.isArray(resumeIds) || resumeIds.length === 0) {
      return NextResponse.json({ error: 'Resume IDs are required' }, { status: 400 });
    }

    if (!jobDescription) {
      return NextResponse.json({ error: 'Job description is required' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all resumes
    const resumes = await prisma.resume.findMany({
      where: {
        id: { in: resumeIds },
      },
    });

    if (resumes.length === 0) {
      return NextResponse.json({ error: 'No valid resumes found' }, { status: 404 });
    }

    const results = [];
    const errors = [];

    // Process each resume
    for (const resume of resumes) {
      try {
        // Create a data URI from the resume content
        // Note: In a real implementation, you might need to convert the JSON content to a text representation
        const resumeText = JSON.stringify(resume.content);
        const resumeDataUri = `data:application/json;base64,${Buffer.from(resumeText).toString('base64')}`;

        // Match the resume to the job description
        const input: RecruiterMatchInput = {
          resumeDataUri,
          jobDescriptionText: jobDescription,
        };

        const matchResult = await matchResumeToJd(input);

        // Store the job match in the database
        const jobMatch = await prisma.jobMatch.create({
          data: {
            resumeId: resume.id,
            jobData: {
              description: jobDescription,
              matchResult,
              matchScore: matchResult.fitmentScore,
            },
          },
        });

        results.push({
          resumeId: resume.id,
          resumeTitle: resume.title,
          matchId: jobMatch.id,
          matchScore: matchResult.fitmentScore,
          assessment: matchResult.assessment,
          keyMatches: matchResult.keyMatches,
          keyMismatches: matchResult.keyMismatches,
        });
      } catch (error) {
        console.error(`Error processing resume ${resume.id}:`, error);
        errors.push({
          resumeId: resume.id,
          resumeTitle: resume.title,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Sort results by match score (descending)
    results.sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({
      success: true,
      message: `Processed ${results.length} resumes with ${errors.length} errors`,
      results,
      errors,
    });
  } catch (error) {
    console.error('Error in batch job matching:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
}