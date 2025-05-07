// src/ai/flows/resume-analyzer.ts
'use server';
/**
 * @fileOverview Analyzes resume data to extract key information.
 *
 * - analyzeResume - A function that handles the resume analysis process.
 * - AnalyzeResumeInput - The input type for the analyzeResume function.
 * - AnalyzeResumeOutput - The return type for the analyzeResume function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeResumeInputSchema = z.object({
  resumeDataUri: z
    .string()
    .describe(
      "The resume data as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeResumeInput = z.infer<typeof AnalyzeResumeInputSchema>;

const AnalyzeResumeOutputSchema = z.object({
  name: z.string().describe('The name of the resume owner.'),
  contactDetails: z.string().describe('The contact details of the resume owner.'),
  skills: z.array(z.string()).describe('A list of skills mentioned in the resume.'),
  education: z.string().describe('The education history of the resume owner.'),
  experience: z.string().describe('The work experience of the resume owner.'),
  projects: z.array(z.string()).optional().describe('A list of projects the resume owner has worked on.')
});
export type AnalyzeResumeOutput = z.infer<typeof AnalyzeResumeOutputSchema>;

export async function analyzeResume(input: AnalyzeResumeInput): Promise<AnalyzeResumeOutput> {
  return analyzeResumeFlow(input);
}

const analyzeResumePrompt = ai.definePrompt({
  name: 'analyzeResumePrompt',
  input: {schema: AnalyzeResumeInputSchema},
  output: {schema: AnalyzeResumeOutputSchema},
  prompt: `You are an AI expert at analyzing resumes.

  Extract the following information from the resume and set the output fields accordingly:

  - name: The full name of the resume owner.
  - contactDetails: All contact details of the resume owner including email address and phone number.
  - skills: A list of skills mentioned in the resume.
  - education: The education history of the resume owner.
  - experience: The work experience of the resume owner.
  - projects: A list of projects the resume owner has worked on.

  Here is the resume data:

  {{media url=resumeDataUri}}`,
});

const analyzeResumeFlow = ai.defineFlow(
  {
    name: 'analyzeResumeFlow',
    inputSchema: AnalyzeResumeInputSchema,
    outputSchema: AnalyzeResumeOutputSchema,
  },
  async input => {
    const {output} = await analyzeResumePrompt(input);
    return output!;
  }
);
