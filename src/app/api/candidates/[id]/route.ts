import { NextRequest, NextResponse } from 'next/server';

// Candidate management has been removed
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    return NextResponse.json({ error: 'Candidate management has been removed' }, { status: 404 });
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    return NextResponse.json({ error: 'Candidate management has been removed' }, { status: 404 });
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    return NextResponse.json({ error: 'Candidate management has been removed' }, { status: 404 });
}