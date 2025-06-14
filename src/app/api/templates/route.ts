import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const templates = await prisma.resumeTemplate.findMany({
            orderBy: {
                isDefault: 'desc',
            },
        });

        return NextResponse.json(templates);
    } catch (error) {
        console.error('Error fetching resume templates:', error);
        return NextResponse.json(
            { error: 'Failed to fetch resume templates' },
            { status: 500 }
        );
    }
}