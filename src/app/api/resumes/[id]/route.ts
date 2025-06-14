import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import fs from 'fs';
import path from 'path';

// GET a specific resume by ID
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const resumeId = params.id;

        const resume = await db.resume.findUnique({
            where: { id: resumeId },
            include: {
                user: true,
                jobMatches: true,
            },
        });

        if (!resume) {
            return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
        }

        return NextResponse.json(resume);
    } catch (error) {
        console.error('Error fetching resume:', error);
        return NextResponse.json({ error: 'Failed to fetch resume' }, { status: 500 });
    }
}

// UPDATE a resume
export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const resumeId = params.id;
        const body = await req.json();
        const { title, content } = body;

        // Validate input
        if (!title && !content) {
            return NextResponse.json(
                { error: 'No data provided for update' },
                { status: 400 }
            );
        }

        // Get the existing resume to check if it exists
        const existingResume = await db.resume.findUnique({
            where: { id: resumeId },
            include: { user: true },
        });

        if (!existingResume) {
            return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
        }

        // Update the resume in the database
        const updatedResume = await db.resume.update({
            where: { id: resumeId },
            data: {
                ...(title && { title }),
                ...(content && { content }),
            },
            include: { user: true },
        });

        // Save resume to file system organized by name
        if (content && existingResume.user) {
            const userName = existingResume.user.name || 'unknown_user';
            const resumeName = title || existingResume.title;
            const sanitizedUserName = userName.replace(/[^a-zA-Z0-9]/g, '_');
            const sanitizedResumeName = resumeName.replace(/[^a-zA-Z0-9]/g, '_');

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

        return NextResponse.json(updatedResume);
    } catch (error) {
        console.error('Error updating resume:', error);
        return NextResponse.json({ error: 'Failed to update resume' }, { status: 500 });
    }
}

// DELETE a resume
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const resumeId = params.id;

        // Get the resume to check if it exists and to get user info
        const existingResume = await db.resume.findUnique({
            where: { id: resumeId },
            include: { user: true },
        });

        if (!existingResume) {
            return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
        }

        // Delete the resume
        await db.resume.delete({
            where: { id: resumeId },
        });

        // Try to delete the file if it exists
        if (existingResume.user) {
            const userName = existingResume.user.name || 'unknown_user';
            const resumeName = existingResume.title;
            const sanitizedUserName = userName.replace(/[^a-zA-Z0-9]/g, '_');
            const sanitizedResumeName = resumeName.replace(/[^a-zA-Z0-9]/g, '_');

            const filePath = path.join(
                process.cwd(),
                'data',
                'resumes',
                sanitizedUserName,
                `${sanitizedResumeName}.json`
            );

            try {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            } catch (fsError) {
                console.error('Error deleting resume file:', fsError);
                // Continue with the response even if file deletion fails
            }
        }

        return NextResponse.json({ message: 'Resume deleted successfully' });
    } catch (error) {
        console.error('Error deleting resume:', error);
        return NextResponse.json({ error: 'Failed to delete resume' }, { status: 500 });
    }
}