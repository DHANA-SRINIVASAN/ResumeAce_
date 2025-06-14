import { NextRequest, NextResponse } from 'next/server';

// Candidate management has been removed
export async function GET(req: NextRequest) {
  return NextResponse.json({ error: 'Candidate management has been removed' }, { status: 404 });
}

export async function POST(req: NextRequest) {
  return NextResponse.json({ error: 'Candidate management has been removed' }, { status: 404 });
}