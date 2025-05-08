// src/ai/flows/career-roadmap-flow.ts
'use server';
/**
 * @fileOverview Generates a career roadmap based on resume analysis and a target role.
 *
 * - generateCareerRoadmap - A function that handles the career roadmap generation.
 * - CareerRoadmapInput - The input type for the function.
 * - CareerRoadmapOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Assuming AnalyzeResumeOutput structure from resume-analyzer.ts
const ResumeAnalysisSchemaForRoadmap = z.object({
  name: z.string().optional(),
  skills: z.array(z.string()).optional(),
  experience: z.string().optional(),
  education: z.string().optional(),
  projects: z.array(z.string()).optional(),
  language: z.string().optional(),
});

const CareerRoadmapInputSchema = z.object({
  resumeAnalysis: ResumeAnalysisSchemaForRoadmap.describe("The analyzed data from the user's resume."),
  currentRole: z.string().optional().describe("The user's current role, if any, extracted from the resume or explicitly stated."),
  targetRole: z.string().describe("The user's desired target role."),
});
export type CareerRoadmapInput = z.infer<typeof CareerRoadmapInputSchema>;

const RoadmapStepSchema = z.object({
  title: z.string().describe("A concise title for this step in the roadmap."),
  description: z.string().describe("A detailed description of what this step entails (e.g., skills to learn, type of experience to gain, key concepts to understand). This should be broken down if complex."),
  estimatedTimeline: z.string().describe("An estimated timeline to complete this step (e.g., '3-6 months', '1 year', 'Ongoing')."),
  resources: z.array(z.string()).optional().describe("A list of suggested resources (e.g., specific course types, books, platforms, communities, tools to master)."),
  keySkillsToDevelop: z.array(z.string()).optional().describe("Specific skills to focus on during this step."),
});

const CareerRoadmapOutputSchema = z.object({
  introduction: z.string().describe("A brief introduction to the roadmap, acknowledging the current state and target role."),
  steps: z.array(RoadmapStepSchema).describe("A list of actionable steps to reach the target role. These steps should be structured and detailed, inspired by resources like roadmap.sh."),
  potentialCertifications: z.array(z.string()).optional().describe("A list of relevant certifications for the target role."),
  projectIdeas: z.array(z.string()).optional().describe("A list of project ideas to build a portfolio for the target role."),
  estimatedSalaryRange: z.string().optional().describe("An estimated salary range for the target role in a general market (e.g., '$X - $Y per year'). Specify if it's region-specific if possible."),
  closingMotivation: z.string().describe("A brief motivational closing statement."),
});
export type CareerRoadmapOutput = z.infer<typeof CareerRoadmapOutputSchema>;
export type RoadmapStep = z.infer<typeof RoadmapStepSchema>;


export async function generateCareerRoadmap(input: CareerRoadmapInput): Promise<CareerRoadmapOutput> {
  return careerRoadmapFlow(input);
}

const careerRoadmapPrompt = ai.definePrompt({
  name: 'careerRoadmapPrompt',
  input: { schema: CareerRoadmapInputSchema },
  output: { schema: CareerRoadmapOutputSchema },
  prompt: `You are an expert AI career planning advisor and strategist.
The user has provided their resume analysis and a target career role.
Your task is to generate a comprehensive, step-by-step career roadmap to help them transition from their current situation (based on their resume) to their target role.
Structure the roadmap steps in a detailed and organized manner, similar to the style found on websites like roadmap.sh. This means each step should clearly outline what needs to be learned or achieved, why it's important, and potential resources or methods.

Resume Analysis Summary:
Skills: {{#if resumeAnalysis.skills}}{{#each resumeAnalysis.skills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}Not specified{{/if}}
Experience Summary: {{resumeAnalysis.experience}}
Education: {{resumeAnalysis.education}}

{{#if currentRole}}Current Role (deduced or stated): {{{currentRole}}}{{/if}}
Target Role: {{{targetRole}}}

Please generate the roadmap with the following sections, ensuring the 'steps' are particularly detailed:
1.  Introduction: Briefly acknowledge the user's current standing (based on resume) and their aspiration for the target role.
2.  Steps: Create a list of 3-5 actionable steps. Each step should include:
    *   title: A concise title for the step (e.g., "Foundational Python and Data Structures").
    *   description: Detailed actions, core concepts to understand, skills to acquire, or experiences to gain. Explain *why* these are important for the progression.
    *   keySkillsToDevelop: (Optional) A list of 3-5 specific skills to focus on during this step (e.g., "Python", "SQL", "Pandas", "Algorithms").
    *   estimatedTimeline: A realistic timeline for the step (e.g., "3-6 months", "Ongoing").
    *   resources: (Optional) Suggest types of resources like "Online courses on AI/ML (e.g., Coursera's Deep Learning Specialization)", "Interactive coding platforms (e.g., LeetCode for algorithms)", "Key books (e.g., 'Python for Data Analysis')", "Relevant communities (e.g., Kaggle for data science projects)", "Open-source contributions to specific types of projects".
3.  Potential Certifications: List 2-3 relevant certifications that would be beneficial for the target role.
4.  Project Ideas: Suggest 2-3 project ideas that would help build a strong portfolio for the target role. These should be practical and showcase learned skills.
5.  Estimated Salary Range: Provide a general estimated annual salary range for the target role. You can specify a common market like the US or India, or state it's a general estimate.
6.  Closing Motivation: A short, encouraging message.

Focus on providing practical, actionable advice. If the resume indicates a beginner level and the target role is advanced, the steps should reflect a realistic progression.
If the target role is very different from the current experience, acknowledge the need for foundational learning.
Ensure the output strictly adheres to the JSON schema. The detail in the 'steps' (description, keySkillsToDevelop, resources) is critical for making the roadmap useful and actionable, similar to the guidance on roadmap.sh.
`,
});

const careerRoadmapFlow = ai.defineFlow(
  {
    name: 'careerRoadmapFlow',
    inputSchema: CareerRoadmapInputSchema,
    outputSchema: CareerRoadmapOutputSchema,
  },
  async (input) => {
    const { output } = await careerRoadmapPrompt(input);
    return output!;
  }
);

