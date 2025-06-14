import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Get all public settings or all settings if admin
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const isAdmin = url.searchParams.get('admin') === 'true';
    
    // For simplicity, we're not implementing real auth checks here
    // In a real app, you'd verify the user is an admin
    
    const settings = await prisma.appSettings.findMany({
      where: isAdmin ? {} : { isPublic: true },
    });
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// Create or update a setting (admin only)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { settingKey, settingValue, settingType, description, isPublic } = body;
    
    // In a real app, you'd verify the user is an admin here
    
    const setting = await prisma.appSettings.upsert({
      where: { settingKey },
      update: {
        settingValue,
        settingType,
        description,
        isPublic,
        updatedAt: new Date(),
      },
      create: {
        settingKey,
        settingValue,
        settingType,
        description,
        isPublic: isPublic || false,
      },
    });
    
    return NextResponse.json(setting);
  } catch (error) {
    console.error('Error updating setting:', error);
    return NextResponse.json(
      { error: 'Failed to update setting' },
      { status: 500 }
    );
  }
}