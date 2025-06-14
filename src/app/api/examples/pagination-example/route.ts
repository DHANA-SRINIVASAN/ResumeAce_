import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Get paginated resumes
    const resumes = await prisma.resume.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Get total count for pagination
    const totalCount = await prisma.resume.count();
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      data: resumes,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Pagination error:', error);
    return NextResponse.json(
      { error: 'An error occurred during pagination' },
      { status: 500 }
    );
  }
}