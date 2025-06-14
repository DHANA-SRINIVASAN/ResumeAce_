import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Google Generative AI with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get request body
        const body = await req.json();
        const { resumeId, resumeText } = body;

        if (!resumeId || !resumeText) {
            return NextResponse.json({ error: 'Resume ID and text are required' }, { status: 400 });
        }

        // Get user from session
        const user = await db.user.findUnique({
            where: { email: session.user.email as string },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Check if resume exists and belongs to user
        const resume = await db.resume.findFirst({
            where: {
                id: resumeId,
                userId: user.id,
            },
        });

        if (!resume) {
            return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
        }

        // Parse resume using Gemini AI
        const parsedData = await parseResumeWithAI(resumeText);

        // Update resume with parsed data
        await db.resume.update({
            where: { id: resumeId },
            data: {
                content: {
                    ...resume.content as any,
                    parsedData,
                },
            },
        });

        // Return parsed data
        return NextResponse.json({
            success: true,
            parsedData,
            message: 'Resume parsed successfully',
        });
    } catch (error) {
        console.error('Error parsing resume:', error);
        return NextResponse.json({ error: 'Failed to parse resume' }, { status: 500 });
    }
}

async function parseResumeWithAI(resumeText: string) {
    try {
        // Create a generative model instance
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // Prompt for resume parsing
        const prompt = `
    Parse the following resume text and extract the following information in JSON format:
    1. Personal Information (name, email, phone, location)
    2. Summary/Objective
    3. Skills (as an array)
    4. Work Experience (array of objects with company, title, dates, and description)
    5. Education (array of objects with institution, degree, dates)
    6. Certifications (as an array)
    7. Languages (as an array)
    8. Projects (as an array of objects)

    Resume Text:
    ${resumeText}

    Return ONLY a valid JSON object with these fields, nothing else.
    `;

        // Generate content
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Extract JSON from the response
        const jsonMatch = text.match(/\\{[\\s\\S]*\\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        throw new Error('Failed to parse JSON from AI response');
    } catch (error) {
        console.error('Error using AI to parse resume:', error);
        // Return a basic structure if AI parsing fails
        return {
            personalInfo: { name: '', email: '', phone: '', location: '' },
            summary: '',
            skills: [],
            workExperience: [],
            education: [],
            certifications: [],
            languages: [],
            projects: []
        };
    }
}