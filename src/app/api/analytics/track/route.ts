import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, eventType, eventData, sessionId } = body;
    
    // Get request headers
    const headersList = headers();
    const userAgent = headersList.get('user-agent') || '';
    const referer = headersList.get('referer') || '';
    const ip = headersList.get('x-forwarded-for') || 
               headersList.get('x-real-ip') || 
               'unknown';
    
    // Create usage stat record
    const usageStat = await prisma.appUsageStats.create({
      data: {
        userId: userId || undefined, // Only set if provided
        eventType,
        eventData: eventData || {},
        userAgent,
        ipAddress: ip,
        referrer: referer,
        sessionId: sessionId || undefined,
      },
    });
    
    return NextResponse.json({ success: true, id: usageStat.id });
  } catch (error) {
    console.error('Error tracking analytics:', error);
    return NextResponse.json(
      { error: 'Failed to track analytics' },
      { status: 500 }
    );
  }
}