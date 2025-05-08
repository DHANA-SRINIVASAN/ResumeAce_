// src/ai/flows/resume-analyzer.ts
'use server';
/**
 * @fileOverview Analyzes resume data to extract key information.
 * Handles text-based resumes and attempts to process image-based ones.
 * Supports resumes in various languages, attempting to parse or translate key fields.
 * Note: For optimal results with image-based resumes (e.g., scanned PDFs, JPEGs),
 * pre-processing with a dedicated OCR tool before sending to this flow is recommended.
 * However, this flow will attempt to interpret media data if provided.
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
      "The resume data as a data URI. This can be from a text-based file (PDF, DOCX converted to text then to data URI) or an image file (JPEG, PNG). It must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'. If it's an image, the AI will attempt OCR."
    ),
});
export type AnalyzeResumeInput = z.infer<typeof AnalyzeResumeInputSchema>;

const AnalyzeResumeOutputSchema = z.object({
  name: z.string().describe('The full name of the resume owner. Attempt to extract even from non-English resumes.'),
  contactDetails: z.string().describe('Contact details (email, phone). Attempt to extract even from non-English resumes.'),
  skills: z.array(z.string()).describe('A list of skills. Extract in the original language or translate to English if confident.'),
  education: z.string().describe('Education history. Extract in the original language or translate to English if confident.'),
  experience: z.string().describe('Work experience. Extract in the original language or translate to English if confident.'),
  projects: z.array(z.string()).optional().describe('A list of projects. Extract in the original language or translate to English if confident.'),
  language: z.string().optional().describe('The primary language detected in the resume (e.g., "English", "Hindi", "French").')
});
export type AnalyzeResumeOutput = z.infer<typeof AnalyzeResumeOutputSchema>;

export async function analyzeResume(input: AnalyzeResumeInput): Promise<AnalyzeResumeOutput> {
  return analyzeResumeFlow(input);
}

const analyzeResumePrompt = ai.definePrompt({
  name: 'analyzeResumePrompt',
  input: {schema: AnalyzeResumeInputSchema},
  output: {schema: AnalyzeResumeOutputSchema},
  prompt: `You are an AI expert at analyzing resumes in various languages. The input might be text or an image.
If the resume is not in English, attempt to parse it as best as possible in its original language.
For fields like name, contact, skills, education, and experience, extract the information. If confident, you can provide an English translation for skills, education, and experience, or keep them in the original language.
Determine the primary language of the resume.

Extract the following information from the resume and set the output fields accordingly:

- name: The full name of the resume owner.
- contactDetails: All contact details of the resume owner including email address and phone number.
- skills: A list of skills mentioned in the resume.
- education: The education history of the resume owner.
- experience: The work experience of the resume owner.
- projects: A list of projects the resume owner has worked on (if any).
- language: The primary language detected in the resume (e.g., "English", "Hindi", "French").

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

