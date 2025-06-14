import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, password, referralSource, initialPlan } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get device info from headers
    const headersList = headers();
    const userAgent = headersList.get('user-agent') || '';
    const deviceInfo = {
      userAgent,
      signupTime: new Date().toISOString(),
    };

    // Create the user with signup data in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the user
      const user = await tx.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
        },
      });

      // Create signup data
      await tx.userSignupData.create({
        data: {
          userId: user.id,
          referralSource: referralSource || 'direct',
          initialPlan: initialPlan || 'free',
          deviceInfo,
          skills: [],
          preferredJobTypes: [],
          preferredLocations: [],
        },
      });

      return user;
    });

    // Return the user without the password
    const { password: _, ...userWithoutPassword } = result;
    
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json(
      { error: 'An error occurred while registering the user' },
      { status: 500 }
    );
  }
}