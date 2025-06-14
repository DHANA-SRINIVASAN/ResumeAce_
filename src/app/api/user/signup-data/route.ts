import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Create or update user signup data
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      userId, 
      referralSource, 
      initialPlan,
      jobTitle,
      industry,
      yearsOfExperience,
      educationLevel,
      location,
      skills,
      jobSearchStatus,
      preferredJobTypes,
      preferredLocations,
      remotePreference,
      deviceInfo
    } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
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

    // Create or update user signup data
    const signupData = await prisma.userSignupData.upsert({
      where: { userId },
      update: {
        referralSource,
        initialPlan,
        jobTitle,
        industry,
        yearsOfExperience,
        educationLevel,
        location,
        skills,
        jobSearchStatus,
        preferredJobTypes,
        preferredLocations,
        remotePreference,
        deviceInfo,
        completedProfile: true,
        updatedAt: new Date(),
      },
      create: {
        userId,
        referralSource,
        initialPlan,
        jobTitle,
        industry,
        yearsOfExperience,
        educationLevel,
        location,
        skills: skills || [],
        jobSearchStatus,
        preferredJobTypes: preferredJobTypes || [],
        preferredLocations: preferredLocations || [],
        remotePreference,
        deviceInfo,
        completedProfile: true,
      },
    });

    return NextResponse.json(signupData);
  } catch (error) {
    console.error('Error creating/updating user signup data:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}

// Get user signup data
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const signupData = await prisma.userSignupData.findUnique({
      where: { userId },
    });

    if (!signupData) {
      return NextResponse.json(
        { error: 'Signup data not found for this user' },
        { status: 404 }
      );
    }

    return NextResponse.json(signupData);
  } catch (error) {
    console.error('Error fetching user signup data:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching user signup data' },
      { status: 500 }
    );
  }
}