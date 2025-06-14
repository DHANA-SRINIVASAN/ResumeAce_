import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');

    let resumes;
    if (userId) {
      resumes = await db.resume.findMany({
        where: { userId },
        include: {
          jobMatches: true,
          user: true,
        },
      });
    } else {
      resumes = await db.resume.findMany({
        include: {
          jobMatches: true,
          user: true,
        },
      });
    }

    return NextResponse.json(resumes);
  } catch (error) {
    console.error('Error fetching resumes:', error);
    return NextResponse.json({ error: 'Failed to fetch resumes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, title, content } = body;

    if (!userId || !title || !content) {
      return NextResponse.json({ error: 'User ID, title, and content are required' }, { status: 400 });
    }

    // Create the resume in the database
    const resume = await db.resume.create({
      data: {
        userId,
        title,
        content,
      },
      include: {
        user: true,
      },
    });

    // Save resume to file system organized by name
    if (resume.user) {
      const userName = resume.user.name || 'unknown_user';
      const sanitizedUserName = userName.replace(/[^a-zA-Z0-9]/g, '_');
      const sanitizedResumeName = title.replace(/[^a-zA-Z0-9]/g, '_');

      // Create directory structure
      const userDir = path.join(process.cwd(), 'data', 'resumes', sanitizedUserName);

      try {
        // Ensure the directory exists
        fs.mkdirSync(userDir, { recursive: true });

        // Write the resume content to a file
        fs.writeFileSync(
          path.join(userDir, `${sanitizedResumeName}.json`),
          JSON.stringify(content, null, 2)
        );
      } catch (fsError) {
        console.error('Error saving resume to file system:', fsError);
        // Continue with the response even if file saving fails
      }
    }

    return NextResponse.json(resume);
  } catch (error) {
    console.error('Error creating resume:', error);
    return NextResponse.json({ error: 'Failed to create resume' }, { status: 500 });
  }
}