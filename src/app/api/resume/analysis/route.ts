import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Create or update resume analysis
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      userId, 
      resumeId,
      extractedData,
      skills,
      experience,
      education,
      missingElements,
      improvementSuggestions,
      atsScore,
      atsIssues,
      jobRecommendations,
      careerPathOptions,
      skillGaps
    } = body;

    if (!userId || !resumeId) {
      return NextResponse.json(
        { error: 'User ID and Resume ID are required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if resume exists
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
    });

    if (!resume) {
      return NextResponse.json(
        { error: 'Resume not found' },
        { status: 404 }
      );
    }

    // Create or update resume analysis
    const analysis = await prisma.resumeAnalysis.upsert({
      where: {
        userId_resumeId: {
          userId,
          resumeId,
        },
      },
      update: {
        extractedData,
        skills,
        experience,
        education,
        missingElements,
        improvementSuggestions,
        atsScore,
        atsIssues,
        jobRecommendations,
        careerPathOptions,
        skillGaps,
        updatedAt: new Date(),
      },
      create: {
        userId,
        resumeId,
        extractedData,
        skills: skills || [],
        experience: experience || [],
        education: education || [],
        missingElements: missingElements || [],
        improvementSuggestions,
        atsScore,
        atsIssues,
        jobRecommendations,
        careerPathOptions,
        skillGaps,
      },
    });

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error creating/updating resume analysis:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}

// Get resume analysis
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const resumeId = url.searchParams.get('resumeId');

    if (!userId || !resumeId) {
      return NextResponse.json(
        { error: 'User ID and Resume ID are required' },
        { status: 400 }
      );
    }

    const analysis = await prisma.resumeAnalysis.findUnique({
      where: {
        userId_resumeId: {
          userId,
          resumeId,
        },
      },
    });

    if (!analysis) {
      return NextResponse.json(
        { error: 'Analysis not found for this resume' },
        { status: 404 }
      );
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error fetching resume analysis:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching resume analysis' },
      { status: 500 }
    );
  }
}