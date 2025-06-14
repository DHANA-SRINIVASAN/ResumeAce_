import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Configuration, OpenAIApi } from 'openai';

const prisma = new PrismaClient();

// Configure OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// POST /api/skill-gap
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { resumeId, jobDescription } = body;
    
    if (!resumeId || !jobDescription) {
      return NextResponse.json(
        { error: 'Resume ID and job description are required' },
        { status: 400 }
      );
    }
    
    // Fetch resume data
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
    });
    
    if (!resume) {
      return NextResponse.json(
        { error: 'Resume not found' },
        { status: 404 }
      );
    }
    
    // Extract skills from resume
    const userSkills = resume.content.skills || [];
    
    // Use OpenAI to extract required skills from job description
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `Extract the required skills from this job description and return them as a comma-separated list: ${jobDescription}`,
      max_tokens: 150,
    });
    
    const requiredSkillsText = response.data.choices[0].text?.trim() || '';
    const requiredSkills = requiredSkillsText
      .split(',')
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0);
    
    // Identify missing skills
    const missingSkills = requiredSkills.filter(
      skill => !userSkills.some(
        userSkill => userSkill.toLowerCase().includes(skill.toLowerCase())
      )
    );
    
    // Generate recommendations for missing skills
    const recommendations = await generateRecommendations(missingSkills);
    
    // Calculate match percentage
    const matchPercentage = calculateMatchPercentage(userSkills, requiredSkills);
    
    // Save the analysis to the database
    const skillGapAnalysis = await prisma.skillGapAnalysis.create({
      data: {
        resumeId,
        jobDescription,
        requiredSkills: requiredSkills,
        missingSkills: missingSkills,
        recommendations,
        matchPercentage,
      },
    });
    
    return NextResponse.json({
      id: skillGapAnalysis.id,
      userSkills,
      requiredSkills,
      missingSkills,
      recommendations,
      matchPercentage,
    });
    
  } catch (error) {
    console.error('Error analyzing skill gap:', error);
    return NextResponse.json(
      { error: 'Failed to analyze skill gap' },
      { status: 500 }
    );
  }
}

// GET /api/skill-gap?resumeId=<resumeId>
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const resumeId = searchParams.get('resumeId');
    
    if (!resumeId) {
      return NextResponse.json(
        { error: 'Resume ID is required' },
        { status: 400 }
      );
    }
    
    // Fetch all skill gap analyses for the resume
    const analyses = await prisma.skillGapAnalysis.findMany({
      where: { resumeId },
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json(analyses);
    
  } catch (error) {
    console.error('Error fetching skill gap analyses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skill gap analyses' },
      { status: 500 }
    );
  }
}

// Helper functions
function calculateMatchPercentage(userSkills: string[], requiredSkills: string[]) {
  if (requiredSkills.length === 0) return 100;
  
  const matchedSkills = requiredSkills.filter(
    skill => userSkills.some(
      userSkill => userSkill.toLowerCase().includes(skill.toLowerCase())
    )
  );
  
  return Math.round((matchedSkills.length / requiredSkills.length) * 100);
}

async function generateRecommendations(missingSkills: string[]) {
  if (missingSkills.length === 0) {
    return [];
  }
  
  // Generate course recommendations for each missing skill
  const recommendations = await Promise.all(
    missingSkills.map(async (skill) => {
      // In a real implementation, this would connect to learning platforms
      // For now, we'll generate mock recommendations
      return {
        skill,
        courses: [
          { title: `Introduction to ${skill}`, platform: 'Coursera', url: '#' },
          { title: `Advanced ${skill}`, platform: 'Udemy', url: '#' },
          { title: `${skill} for Professionals`, platform: 'LinkedIn Learning', url: '#' },
        ],
        resources: [
          { title: `${skill} Documentation`, type: 'Documentation', url: '#' },
          { title: `Learn ${skill} in 30 Days`, type: 'Tutorial', url: '#' },
        ],
      };
    })
  );
  
  return recommendations;
}