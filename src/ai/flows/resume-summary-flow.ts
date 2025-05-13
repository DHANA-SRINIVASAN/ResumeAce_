// src/ai/flows/resume-summary-flow.ts
'use server';
/**
 * @fileOverview Generates a professional summary from resume text.
 *
 * - generateResumeSummary - A function that handles the summary generation.
 * - ResumeSummaryInput - The input type for the function.
 * - ResumeSummaryOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ResumeSummaryInputSchema = z.object({
  resumeText: z.string().describe('The full text content of the resume to be summarized.'),
});
export type ResumeSummaryInput = z.infer<typeof ResumeSummaryInputSchema>;

const ResumeSummaryOutputSchema = z.object({
  summary: z.string().describe('A concise professional summary (2-4 sentences) based on the resume text.'),
});
export type ResumeSummaryOutput = z.infer<typeof ResumeSummaryOutputSchema>;

export async function generateResumeSummary(input: ResumeSummaryInput): Promise<ResumeSummaryOutput> {
  return resumeSummaryFlow(input);
}

const resumeSummaryPrompt = ai.definePrompt({
  name: 'resumeSummaryPrompt',
  input: { schema: ResumeSummaryInputSchema },
  output: { schema: ResumeSummaryOutputSchema },
  prompt: `You are an expert AI resume analyst. Based on the provided resume text, generate a concise and compelling professional summary.
The summary should be 2-4 sentences long and highlight the candidate's key qualifications, experience, and career aspirations if evident.
Focus on action verbs and quantifiable achievements where possible.

Resume Text:
{{{resumeText}}}

Output the summary strictly in the defined JSON schema.
`,
});

const resumeSummaryFlow = ai.defineFlow(
  {
    name: 'resumeSummaryFlow',
    inputSchema: ResumeSummaryInputSchema,
    outputSchema: ResumeSummaryOutputSchema,
  },
  async (input) => {
    const { output } = await resumeSummaryPrompt(input);
    return output!;
  }
);
