'use server';
/**
 * @fileOverview Provides a resume scoring AI agent.
 *
 * - analyzeResumeAndScore - A function that analyzes the resume and returns a score.
 * - AnalyzeResumeAndScoreInput - The input type for the analyzeResumeAndScore function.
 * - AnalyzeResumeAndScoreOutput - The return type for the analyzeResumeAndScore function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeResumeAndScoreInputSchema = z.object({
  resumeText: z.string().describe('The text content of the resume to be analyzed.'),
});
export type AnalyzeResumeAndScoreInput = z.infer<typeof AnalyzeResumeAndScoreInputSchema>;

const AnalyzeResumeAndScoreOutputSchema = z.object({
  score: z.number().describe('A score between 0 and 100 indicating the overall quality of the resume.'),
  feedback: z.string().describe('A brief feedback statement based on the score.'),
});
export type AnalyzeResumeAndScoreOutput = z.infer<typeof AnalyzeResumeAndScoreOutputSchema>;

export async function analyzeResumeAndScore(input: AnalyzeResumeAndScoreInput): Promise<AnalyzeResumeAndScoreOutput> {
  return analyzeResumeAndScoreFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeResumeAndScorePrompt',
  input: {schema: AnalyzeResumeAndScoreInputSchema},
  output: {schema: AnalyzeResumeAndScoreOutputSchema},
  prompt: `You are an AI resume analyst. You will receive the text content of a resume. Analyze the resume and provide a score between 0 and 100, and a brief feedback statement.

Here is the resume text:

{{{resumeText}}}

Consider the following criteria when scoring the resume:

* Clarity and conciseness
* Relevance to the target role
* Quantifiable achievements
* Proper formatting and grammar

Ensure that the score is a number between 0 and 100, and the feedback is a concise statement of fewer than 20 words. Set the score and feedback output fields appropriately.`,
});

const analyzeResumeAndScoreFlow = ai.defineFlow(
  {
    name: 'analyzeResumeAndScoreFlow',
    inputSchema: AnalyzeResumeAndScoreInputSchema,
    outputSchema: AnalyzeResumeAndScoreOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
