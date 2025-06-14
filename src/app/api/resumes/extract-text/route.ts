import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { join } from 'path';
import { readFile } from 'fs/promises';
import * as pdfjs from 'pdfjs-dist';
import mammoth from 'mammoth';

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request body
    const body = await req.json();
    const { resumeId } = body;

    if (!resumeId) {
      return NextResponse.json({ error: 'Resume ID is required' }, { status: 400 });
    }

    // Get user from session
    const user = await db.user.findUnique({
      where: { email: session.user.email as string },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if resume exists and belongs to user
    const resume = await db.resume.findFirst({
      where: {
        id: resumeId,
        userId: user.id,
      },
    });

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    // Get file path from resume content
    const content = resume.content as any;
    if (!content || !content.filePath) {
      return NextResponse.json({ error: 'Resume file path not found' }, { status: 404 });
    }

    // Get file path
    const filePath = join(process.cwd(), 'public', content.filePath.replace(/^\//, ''));
    
    // Extract text based on file type
    let extractedText = '';
    if (content.fileType === 'application/pdf') {
      extractedText = await extractTextFromPDF(filePath);
    } else if (content.fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      extractedText = await extractTextFromDOCX(filePath);
    } else {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    // Return extracted text
    return NextResponse.json({ 
      success: true, 
      text: extractedText,
      message: 'Text extracted successfully',
    });
  } catch (error) {
    console.error('Error extracting text from resume:', error);
    return NextResponse.json({ error: 'Failed to extract text from resume' }, { status: 500 });
  }
}

async function extractTextFromPDF(filePath: string): Promise<string> {
  try {
    // Load the PDF file
    const data = await readFile(filePath);
    const pdfDocument = await pdfjs.getDocument({ data }).promise;
    
    let text = '';
    
    // Extract text from each page
    for (let i = 1; i <= pdfDocument.numPages; i++) {
      const page = await pdfDocument.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item: any) => item.str).join(' ');
      text += pageText + '\n';
    }
    
    return text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

async function extractTextFromDOCX(filePath: string): Promise<string> {
  try {
    // Load the DOCX file
    const data = await readFile(filePath);
    const result = await mammoth.extractRawText({ buffer: data });
    return result.value;
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
    throw new Error('Failed to extract text from DOCX');
  }
}