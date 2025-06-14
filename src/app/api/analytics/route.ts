import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        // In a real app, you would check if the user is an admin here
        // For simplicity, we're just checking a query parameter
        const url = new URL(request.url);
        const isAdmin = url.searchParams.get('admin') === 'true';

        if (!isAdmin) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        // Get filters from query parameters
        const eventType = url.searchParams.get('eventType');
        const userId = url.searchParams.get('userId');
        const sessionId = url.searchParams.get('sessionId');
        const startDate = url.searchParams.get('startDate');
        const endDate = url.searchParams.get('endDate');

        // Build the where clause based on filters
        const where: any = {};

        if (eventType) {
            where.eventType = eventType;
        }

        if (userId) {
            where.userId = userId;
        }

        if (sessionId) {
            where.sessionId = sessionId;
        }

        if (startDate || endDate) {
            where.timestamp = {};

            if (startDate) {
                where.timestamp.gte = new Date(startDate);
            }

            if (endDate) {
                where.timestamp.lte = new Date(endDate);
            }
        }

        // Get the analytics data
        const stats = await prisma.appUsageStats.findMany({
            where,
            orderBy: {
                timestamp: 'desc',
            },
            take: 1000, // Limit to 1000 records for performance
        });

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Error fetching analytics:', error);
        return NextResponse.json(
            { error: 'Failed to fetch analytics data' },
            { status: 500 }
        );
    }
}