// src/app/api/resumes/livecareer/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { searchResumes, fetchResumeById, convertToAppResume } from '@/services/livecareer-api';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const resumeId = searchParams.get('resumeId');
    const keywords = searchParams.get('keywords');
    const skills = searchParams.get('skills')?.split(',');
    const location = searchParams.get('location');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    
    // If resumeId is provided, fetch a specific resume
    if (resumeId) {
      const resume = await fetchResumeById(resumeId);
      if (!resume) {
        return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
      }
      return NextResponse.json(resume);
    }
    
    // Otherwise, search for resumes
    const resumes = await searchResumes({
      keywords: keywords || undefined,
      skills: skills || undefined,
      location: location || undefined,
      limit,
    });
    
    return NextResponse.json(resumes);
  } catch (error) {
    console.error('Error fetching LiveCareer resumes:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, resumeId } = body;
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    if (!resumeId) {
      return NextResponse.json({ error: 'Resume ID is required' }, { status: 400 });
    }
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Fetch the resume from LiveCareer
    const liveCareerResume = await fetchResumeById(resumeId);
    
    if (!liveCareerResume) {
      return NextResponse.json({ error: 'Resume not found on LiveCareer' }, { status: 404 });
    }
    
    // Convert to app format
    const appResume = convertToAppResume(liveCareerResume);
    
    // Create resume in database
    const resume = await prisma.resume.create({
      data: {
        userId,
        title: appResume.title,
        content: appResume.content,
      },
    });
    
    // Save to file system
    const userName = user.name || 'unknown_user';
    const sanitizedUserName = userName.replace(/[^a-zA-Z0-9]/g, '_');
    const sanitizedResumeName = appResume.title.replace(/[^a-zA-Z0-9]/g, '_');
    
    const userDir = path.join(process.cwd(), 'data', 'resumes', sanitizedUserName);
    fs.mkdirSync(userDir, { recursive: true });
    
    const filePath = path.join(userDir, `${sanitizedResumeName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(appResume.content, null, 2));
    
    return NextResponse.json({
      success: true,
      message: 'Resume imported from LiveCareer successfully',
      resume: {
        id: resume.id,
        title: resume.title,
        createdAt: resume.createdAt,
      },
    });
  } catch (error) {
    console.error('Error importing LiveCareer resume:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
}