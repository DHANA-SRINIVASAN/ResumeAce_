import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { fileToDataUri } from '@/lib/file-utils';
import { analyzeResume } from '@/ai/flows/resume-analyzer';

// GET /api/candidates/[id]/resumes - Get all resumes for a candidate
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // First, check if the candidate exists and belongs to the user
    const candidate = await prisma.candidate.findUnique({
      where: { id: params.id },
      include: {
        user: true,
      },
    });

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    if (candidate.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get all resumes for the candidate
    const resumes = await prisma.candidateResume.findMany({
      where: { candidateId: params.id },
      include: {
        analysis: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(resumes);
  } catch (error) {
    console.error('Error fetching candidate resumes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch candidate resumes' },
      { status: 500 }
    );
  }
}

// POST /api/candidates/[id]/resumes - Upload a new resume for a candidate
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // First, check if the candidate exists and belongs to the user
    const candidate = await prisma.candidate.findUnique({
      where: { id: params.id },
    });

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    if (candidate.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Resume file is required' },
        { status: 400 }
      );
    }

    // Convert file to data URI for AI processing
    const resumeDataUri = await fileToDataUri(file);

    // Process the resume with AI
    const analysis = await analyzeResume({ resumeDataUri });

    // In a real implementation, you would upload the file to a storage service
    // and get a URL. For now, we'll just use a placeholder URL.
    const fileUrl = `/api/files/${Date.now()}-${file.name}`;

    // Create a new resume
    const resume = await prisma.candidateResume.create({
      data: {
        title: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileUrl,
        content: `${analysis.name}\n${analysis.contactDetails}\n\nSkills: ${analysis.skills.join(', ')}\n\nEducation: ${analysis.education}\n\nExperience: ${analysis.experience}`,
        parsedData: {
          skills: analysis.skills,
          experience: analysis.experience,
          education: analysis.education,
        },
        candidateId: params.id,
        analysis: {
          create: {
            skills: analysis.skills,
            experience: analysis.experience,
            education: analysis.education,
            summary: `${analysis.name} - ${analysis.skills.length} skills, ${analysis.education.split(',').length} education entries`,
          },
        },
      },
      include: {
        analysis: true,
      },
    });

    return NextResponse.json(resume, { status: 201 });
  } catch (error) {
    console.error('Error uploading candidate resume:', error);
    return NextResponse.json(
      { error: 'Failed to upload candidate resume' },
      { status: 500 }
    );
  }
}