import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // Count resumes by user
    const resumeCountByUser = await prisma.resume.groupBy({
      by: ['userId'],
      _count: {
        id: true,
      },
    });

    // Get users with their resume count
    const usersWithResumeCount = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        _count: {
          select: {
            resumes: true,
          },
        },
      },
    });

    // Get the average match score for job matches
    const averageMatchScore = await prisma.jobMatch.aggregate({
      _avg: {
        matchScore: true,
      },
    });

    return NextResponse.json({
      resumeCountByUser,
      usersWithResumeCount,
      averageMatchScore,
    });
  } catch (error) {
    console.error('Aggregation error:', error);
    return NextResponse.json(
      { error: 'An error occurred during aggregation' },
      { status: 500 }
    );
  }
}