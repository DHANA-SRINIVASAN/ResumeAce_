import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// POST /api/auth/reset-password
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, password } = body;
    
    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }
    
    // Find the password reset record
    const passwordReset = await prisma.passwordReset.findFirst({
      where: {
        token,
        expiresAt: {
          gt: new Date(), // Token must not be expired
        },
        used: false, // Token must not have been used
      },
      include: {
        user: true,
      },
    });
    
    if (!passwordReset) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      );
    }
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update the user's password
    await prisma.user.update({
      where: {
        id: passwordReset.userId,
      },
      data: {
        password: hashedPassword,
      },
    });
    
    // Mark the token as used
    await prisma.passwordReset.update({
      where: {
        id: passwordReset.id,
      },
      data: {
        used: true,
      },
    });
    
    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully.',
    });
    
  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}