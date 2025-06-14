import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, templateId, title } = body;

        if (!userId || !templateId) {
            return NextResponse.json(
                { error: 'User ID and template ID are required' },
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

        // Check if template exists
        const template = await prisma.resumeTemplate.findUnique({
            where: { id: templateId },
        });

        if (!template) {
            return NextResponse.json(
                { error: 'Template not found' },
                { status: 404 }
            );
        }

        // Create an empty resume with the selected template
        const resume = await prisma.resume.create({
            data: {
                userId,
                title: title || `${template.name} Resume`,
                content: {
                    template: template.name,
                    sections: {
                        personalInfo: {
                            name: '',
                            email: '',
                            phone: '',
                            address: '',
                            linkedin: '',
                            website: '',
                        },
                        summary: '',
                        experience: [],
                        education: [],
                        skills: [],
                        certifications: [],
                        languages: [],
                        projects: [],
                    },
                },
            },
        });

        return NextResponse.json(resume);
    } catch (error) {
        console.error('Error creating resume with template:', error);
        return NextResponse.json(
            { error: 'An error occurred while creating the resume' },
            { status: 500 }
        );
    }
}