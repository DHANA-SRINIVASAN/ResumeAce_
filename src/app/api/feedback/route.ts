import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Submit feedback
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, feedbackType, content, rating } = body;
    
    if (!feedbackType || !content) {
      return NextResponse.json(
        { error: 'Feedback type and content are required' },
        { status: 400 }
      );
    }
    
    const feedback = await prisma.feedback.create({
      data: {
        userId: userId || undefined,
        feedbackType,
        content,
        rating: rating || null,
      },
    });
    
    return NextResponse.json({
      success: true,
      message: 'Thank you for your feedback!',
      id: feedback.id,
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}

// Get all feedback (admin only)
export async function GET(request: Request) {
  try {
    // In a real app, you'd verify the user is an admin here
    
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const type = url.searchParams.get('type');
    
    const feedback = await prisma.feedback.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(type ? { feedbackType: type } : {}),
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    
    return NextResponse.json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}