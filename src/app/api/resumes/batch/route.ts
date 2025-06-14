import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { fileToDataUri } from '@/lib/file-utils';
import { analyzeResume } from '@/ai/flows/resume-analyzer';

// POST /api/resumes/batch - Upload multiple resumes and create candidates
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No resume files provided' },
        { status: 400 }
      );
    }

    const results = [];
    const errors = [];

    // Process each file
    for (const file of files) {
      try {
        // Convert file to data URI for AI processing
        const resumeDataUri = await fileToDataUri(file);
        
        // Process the resume with AI
        const analysis = await analyzeResume({ resumeDataUri });
        
        // Extract candidate name from resume analysis
        const candidateName = analysis.candidateName || file.name.replace(/\.[^/.]+$/, "");
        
        // In a real implementation, you would upload the file to a storage service
        // and get a URL. For now, we'll just use a placeholder URL.
        const fileUrl = `/api/files/${Date.now()}-${file.name}`;
        
        // Create a new candidate with the resume
        const candidate = await prisma.candidate.create({
          data: {
            name: candidateName,
            email: analysis.contactInfo?.email,
            phone: analysis.contactInfo?.phone,
            userId: user.id,
            resumes: {
              create: {
                title: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
                fileUrl,
                content: analysis.resumeText,
                parsedData: {
                  skills: analysis.skills,
                  experience: analysis.experience,
                  education: analysis.education,
                },
                analysis: {
                  create: {
                    skills: analysis.skills,
                    experience: analysis.experience,
                    education: analysis.education,
                    summary: analysis.summary,
                  },
                },
              },
            },
          },
          include: {
            resumes: {
              include: {
                analysis: true,
              },
            },
          },
        });

        results.push({
          success: true,
          candidate,
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
      success: errors.length === 0,
      message: `Processed ${results.length} resumes with ${errors.length} errors`,
      results,
      errors,
    });
  } catch (error) {
    console.error('Error processing batch resumes:', error);
    return NextResponse.json(
      { error: 'Failed to process batch resumes' },
      { status: 500 }
    );
  }
}