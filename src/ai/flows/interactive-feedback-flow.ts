// src/ai/flows/interactive-feedback-flow.ts
'use server';
/**
 * @fileOverview Provides interactive feedback on a resume based on user questions.
 *
 * - getInteractiveFeedback - A function that handles the interactive feedback process.
 * - InteractiveFeedbackInput - The input type for the getInteractiveFeedback function.
 * - InteractiveFeedbackOutput - The return type for the getInteractiveFeedback function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { AnalyzeResumeOutput } from './resume-analyzer'; // Assuming schema is in the same dir or adjust path

// Re-define or import AnalyzeResumeOutputSchema if not directly accessible
// For simplicity, defining a subset or assuming AnalyzeResumeOutput structure
const ResumeAnalysisSchemaForFeedback = z.object({
  name: z.string().optional(),
  contactDetails: z.string().optional(),
  skills: z.array(z.string()).optional(),
  education: z.string().optional(),
  experience: z.string().optional(),
  projects: z.array(z.string()).optional(),
  language: z.string().optional(),
});


const InteractiveFeedbackInputSchema = z.object({
  resumeAnalysis: ResumeAnalysisSchemaForFeedback.describe("The analyzed data from the user's resume."),
  userQuestion: z.string().describe("The user's specific question about their resume or how to improve it."),
  resumeScore: z.number().optional().describe("The overall score of the resume (0-100), if available."),
});
export type InteractiveFeedbackInput = z.infer<typeof InteractiveFeedbackInputSchema>;

const InteractiveFeedbackOutputSchema = z.object({
  answer: z.string().describe("A helpful and actionable answer to the user's question, based on their resume analysis and score."),
});
export type InteractiveFeedbackOutput = z.infer<typeof InteractiveFeedbackOutputSchema>;

export async function getInteractiveFeedback(input: InteractiveFeedbackInput): Promise<InteractiveFeedbackOutput> {
  return interactiveFeedbackFlow(input);
}

const interactiveFeedbackPrompt = ai.definePrompt({
  name: 'interactiveFeedbackPrompt',
  input: { schema: InteractiveFeedbackInputSchema },
  output: { schema: InteractiveFeedbackOutputSchema },
  prompt: `You are an expert AI resume advisor and career coach.
The user has uploaded their resume, which has been analyzed. They also received an overall score for their resume.
Based on the provided resume analysis, their overall score (if available), and their specific question, provide a clear, concise, helpful, and actionable answer.
Your goal is to help them understand their resume better and guide them on improvements.

Resume Analysis:
Name: {{resumeAnalysis.name}}
Contact: {{resumeAnalysis.contactDetails}}
Skills: {{#if resumeAnalysis.skills}}{{#each resumeAnalysis.skills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}Not available{{/if}}
Education: {{resumeAnalysis.education}}
Experience: {{resumeAnalysis.experience}}
Projects: {{#if resumeAnalysis.projects}}{{#each resumeAnalysis.projects}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}Not available{{/if}}
Language: {{resumeAnalysis.language}}

{{#if resumeScore}}
Overall Resume Score: {{resumeScore}}/100
{{/if}}

User's Question: {{{userQuestion}}}

Provide a constructive and supportive response. If the question is about a low-rated section, explain potential reasons based on common best practices and the provided analysis.
If the question is about improvement for a specific job type, tailor your advice accordingly.
Keep your answer focused and directly address the user's question.
`,
});

const interactiveFeedbackFlow = ai.defineFlow(
  {
    name: 'interactiveFeedbackFlow',
    inputSchema: InteractiveFeedbackInputSchema,
    outputSchema: InteractiveFeedbackOutputSchema,
  },
  async (input) => {
    const { output } = await interactiveFeedbackPrompt(input);
    return output!;
  }
);
