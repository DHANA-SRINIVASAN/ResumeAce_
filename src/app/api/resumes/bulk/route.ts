// src/app/api/resumes/bulk/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { analyzeResume } from '@/ai/flows/resume-analyzer';
import { fileToDataUri } from '@/lib/file-utils';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const userId = formData.get('userId') as string;
    const files = formData.getAll('files') as File[];

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const results = [];
    const errors = [];

    // Process each file
    for (const file of files) {
      try {
        // Convert file to data URI for AI analysis
        const resumeDataUri = await fileToDataUri(file);
        
        // Analyze the resume using AI
        const analysis = await analyzeResume({ resumeDataUri });
        
        // Create a title for the resume based on the analysis
        const resumeTitle = analysis.name ? `${analysis.name}'s Resume` : `Resume ${new Date().toISOString()}`;
        
        // Create resume content from analysis
        const resumeContent = {
          personalInfo: {
            name: analysis.name,
            contact: analysis.contactDetails,
          },
          skills: analysis.skills,
          education: analysis.education,
          experience: analysis.experience,
          projects: analysis.projects || [],
          language: analysis.language || 'English',
        };
        
        // Create resume in database
        const resume = await prisma.resume.create({
          data: {
            userId,
            title: resumeTitle,
            content: resumeContent,
          },
        });
        
        // Save to file system
        const userName = user.name || 'unknown_user';
        const sanitizedUserName = userName.replace(/[^a-zA-Z0-9]/g, '_');
        const sanitizedResumeName = resumeTitle.replace(/[^a-zA-Z0-9]/g, '_');
        
        const userDir = path.join(process.cwd(), 'data', 'resumes', sanitizedUserName);
        fs.mkdirSync(userDir, { recursive: true });
        
        const filePath = path.join(userDir, `${sanitizedResumeName}.json`);
        fs.writeFileSync(filePath, JSON.stringify(resumeContent, null, 2));
        
        results.push({
          id: resume.id,
          title: resume.title,
          createdAt: resume.createdAt,
        });
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        errors.push({
          fileName: file.name,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${results.length} resumes with ${errors.length} errors`,
      results,
      errors,
    });
  } catch (error) {
    console.error('Error in bulk resume upload:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
}