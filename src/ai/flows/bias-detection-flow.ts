// src/ai/flows/bias-detection-flow.ts
'use server';
/**
 * @fileOverview Detects potential biases and suggests improvements for inclusive language in a resume.
 *
 * - detectBiasInResume - A function that handles the bias detection process.
 * - BiasDetectionInput - The input type for the function.
 * - BiasDetectionOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const BiasDetectionInputSchema = z.object({
  resumeText: z.string().describe("The full text content of the resume to be analyzed for biases."),
});
export type BiasDetectionInput = z.infer<typeof BiasDetectionInputSchema>;

const DetectedBiasSchema = z.object({
  biasType: z.string().describe("The type of bias detected (e.g., 'Gender-coded language', 'Age-related terms', 'Outdated terminology', 'Length concern')."),
  originalText: z.string().optional().describe("The specific text snippet from the resume that triggered the detection (if applicable)."),
  suggestion: z.string().describe("A suggestion for improvement or a more inclusive alternative."),
  explanation: z.string().describe("A brief explanation of why this might be perceived as bias or how the suggestion helps."),
});

const BiasDetectionOutputSchema = z.object({
  overallAssessment: z.string().describe("A general assessment of the resume's inclusivity (e.g., 'Generally inclusive', 'Some areas for improvement')."),
  detectedItems: z.array(DetectedBiasSchema).describe("A list of detected potential biases or areas for improvement."),
  positiveNotes: z.array(z.string()).optional().describe("Any positive aspects noted regarding inclusivity."),
});
export type BiasDetectionOutput = z.infer<typeof BiasDetectionOutputSchema>;
export type DetectedBias = z.infer<typeof DetectedBiasSchema>;


export async function detectBiasInResume(input: BiasDetectionInput): Promise<BiasDetectionOutput> {
  return detectBiasFlow(input);
}

const detectBiasPrompt = ai.definePrompt({
  name: 'detectBiasPrompt',
  input: { schema: BiasDetectionInputSchema },
  output: { schema: BiasDetectionOutputSchema },
  prompt: `You are an AI expert in Diversity, Equity, and Inclusion (DEI) specializing in resume reviews.
Analyze the provided resume text for potential biases and areas where language can be made more inclusive.

Consider the following:
-   Gender-coded language (e.g., words like "rockstar," "ninja," "dominant," "aggressive" vs. "supportive," "collaborative").
-   Resume length bias (is it excessively long or short for typical expectations?).
-   Outdated terminology or jargon that might not be universally understood or could indicate age.
-   Phrases that might unintentionally exclude candidates from certain backgrounds.
-   Lack of quantifiable achievements if it leads to subjective interpretation.

For each detected item, provide:
-   biasType: The category of the issue.
-   originalText: The problematic text snippet (if a specific snippet).
-   suggestion: A concrete suggestion for improvement.
-   explanation: Why the original might be an issue and how the suggestion helps.

Provide an overall assessment of inclusivity and any positive notes if applicable.
If no significant issues are found, state that the resume appears generally inclusive.

Resume Text:
{{{resumeText}}}

Output the analysis strictly in the defined JSON schema.
Example for a detected item:
{
  "biasType": "Gender-coded language",
  "originalText": "Managed a team of ninjas",
  "suggestion": "Led a high-performing team",
  "explanation": "'Ninjas' can be perceived as overly informal and potentially exclusionary. 'High-performing team' is more professional and inclusive."
}
If resume length is a concern:
{
  "biasType": "Length concern",
  "suggestion": "Consider condensing the experience section to focus on the most relevant achievements from the last 10-15 years if the resume is very long, or elaborating on key projects if it's very short for the experience level.",
  "explanation": "Very long resumes may deter busy recruiters, while very short ones might not fully showcase capabilities. Aim for clarity and impact within 1-2 pages for most roles."
}
`,
});

const detectBiasFlow = ai.defineFlow(
  {
    name: 'detectBiasFlow',
    inputSchema: BiasDetectionInputSchema,
    outputSchema: BiasDetectionOutputSchema,
  },
  async (input) => {
    const { output } = await detectBiasPrompt(input);
    // Ensure detectedItems is always an array, even if empty
    if (output && !output.detectedItems) {
      output.detectedItems = [];
    }
    return output!;
  }
);
