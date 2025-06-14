import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Create a new recruiter match
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      recruiterId,
      jobTitle,
      jobDescription,
      jobRequirements,
      jobLocation,
      candidateName,
      candidateEmail,
      resumeText,
      resumeFile,
      matchScore,
      skillMatch,
      experienceMatch,
      educationMatch,
      strengths,
      weaknesses,
      recommendations,
      status,
      notes
    } = body;

    if (!recruiterId || !jobTitle || !jobDescription || !candidateName || !resumeText) {
      return NextResponse.json(
        { error: 'Required fields are missing' },
        { status: 400 }
      );
    }

    // Check if recruiter exists
    const recruiter = await prisma.user.findUnique({
      where: { id: recruiterId },
    });

    if (!recruiter) {
      return NextResponse.json(
        { error: 'Recruiter not found' },
        { status: 404 }
      );
    }

    // Create recruiter match
    const match = await prisma.recruiterMatch.create({
      data: {
        recruiterId,
        jobTitle,
        jobDescription,
        jobRequirements,
        jobLocation,
        candidateName,
        candidateEmail,
        resumeText,
        resumeFile,
        matchScore,
        skillMatch,
        experienceMatch,
        educationMatch,
        strengths: strengths || [],
        weaknesses: weaknesses || [],
        recommendations,
        status: status || 'new',
        notes,
      },
    });

    return NextResponse.json(match);
  } catch (error) {
    console.error('Error creating recruiter match:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}

// Get recruiter matches
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const recruiterId = url.searchParams.get('recruiterId');
    const status = url.searchParams.get('status');
    const jobTitle = url.searchParams.get('jobTitle');
    const candidateName = url.searchParams.get('candidateName');
    const minScore = url.searchParams.get('minScore');

    if (!recruiterId) {
      return NextResponse.json(
        { error: 'Recruiter ID is required' },
        { status: 400 }
      );
    }

    // Build the where clause based on filters
    const where: any = {
      recruiterId,
    };

    if (status) {
      where.status = status;
    }

    if (jobTitle) {
      where.jobTitle = {
        contains: jobTitle,
        mode: 'insensitive',
      };
    }

    if (candidateName) {
      where.candidateName = {
        contains: candidateName,
        mode: 'insensitive',
      };
    }

    if (minScore) {
      where.matchScore = {
        gte: parseInt(minScore),
      };
    }

    const matches = await prisma.recruiterMatch.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(matches);
  } catch (error) {
    console.error('Error fetching recruiter matches:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching recruiter matches' },
      { status: 500 }
    );
  }
}

// Update a recruiter match
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { 
      id,
      status,
      notes,
      recommendations
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Match ID is required' },
        { status: 400 }
      );
    }

    // Check if match exists
    const existingMatch = await prisma.recruiterMatch.findUnique({
      where: { id },
    });

    if (!existingMatch) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }

    // Update match
    const updatedMatch = await prisma.recruiterMatch.update({
      where: { id },
      data: {
        status,
        notes,
        recommendations,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedMatch);
  } catch (error) {
    console.error('Error updating recruiter match:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating the match' },
      { status: 500 }
    );
  }
}