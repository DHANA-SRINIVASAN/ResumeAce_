// src/ai/flows/recruiter-matcher-flow.ts
'use server';
/**
 * @fileOverview Matches a candidate's resume to a job description and provides a fitment score and analysis.
 *
 * - matchResumeToJd - A function that handles the resume to JD matching process.
 * - RecruiterMatchInput - The input type for the function.
 * - RecruiterMatchOutput - The return type for the function.
 * - RecommendedCourse - The type for a recommended course (reused from course-recommender-flow).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Reusing RecommendedCourseSchema from course-recommender-flow.ts for consistency
const RecommendedCourseSchema = z.object({
  title: z.string().describe('The title of the recommended course or learning path. This field is absolutely mandatory.'),
  platform: z.string().describe('The platform offering the course (e.g., Coursera, Udemy, edX, YouTube Channel Name, official documentation site). This field is mandatory.'),
  description: z.string().describe('A brief description of why this course is relevant based on skills, gaps, or target role.'),
  url: z.string().optional().describe('A direct or search URL for the course. Example for Coursera: "https://www.coursera.org/search?query=Machine%20Learning" or a specific course URL if known.'),
  focusArea: z.string().optional().describe("The primary skill or area this course addresses (e.g., 'Python', 'Data Analysis', 'Project Management')."),
});
export type RecommendedCourse = z.infer<typeof RecommendedCourseSchema>;

const RecruiterMatchInputSchema = z.object({
  resumeDataUri: z
    .string()
    .describe(
      "The candidate's resume data as a data URI. This can be from a text-based file (PDF, DOCX converted to text then to data URI) or an image file (JPEG, PNG). It must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'. If it's an image, the AI will attempt OCR."
    ),
  jobDescriptionText: z.string().describe("The full text of the job description."),
});
export type RecruiterMatchInput = z.infer<typeof RecruiterMatchInputSchema>;

const RecruiterMatchOutputSchema = z.object({
  fitmentScore: z.number().min(0).max(100).describe("A numerical score from 0 to 100 indicating how well the resume matches the job description."),
  assessment: z.string().describe("A concise qualitative assessment of the fit (e.g., 'Excellent Fit', 'Good Fit', 'Fair Match', 'Needs Significant Improvement')."),
  reasoning: z.string().describe("A brief explanation for the score, highlighting key alignments and discrepancies between the resume and JD."),
  keyMatches: z.array(z.string()).describe("An array of strings listing specific skills, experiences, or qualifications from the resume that align well with the job description."),
  keyMismatches: z.array(z.string()).describe("An array of strings listing critical skills or qualifications required by the job description that are missing or not evident in the resume (skill gaps)."),
  courseRecommendations: z.array(RecommendedCourseSchema).optional().describe("If the fitmentScore is below 70, an optional list of up to 3 course recommendations to address skill gaps. Each recommendation must include 'title', 'platform', and 'description'.")
});
export type RecruiterMatchOutput = z.infer<typeof RecruiterMatchOutputSchema>;

export async function matchResumeToJd(input: RecruiterMatchInput): Promise<RecruiterMatchOutput> {
  return recruiterMatchFlow(input);
}

const recruiterMatcherPrompt = ai.definePrompt({
  name: 'recruiterMatcherPrompt',
  input: { schema: RecruiterMatchInputSchema },
  output: { schema: RecruiterMatchOutputSchema },
  prompt: `You are an expert AI hiring manager specializing in evaluating candidate resumes against job descriptions.
Analyze the provided candidate resume (given as media data) and the job description text.

Your evaluation must include the following, adhering strictly to the JSON output schema:
1.  **fitmentScore**: A numerical score from 0 to 100 representing the overall match.
    *   Consider skills, experience relevance (years, type), education, and keywords.
    *   A score of 85+ is excellent, 70-84 is good, 50-69 is fair, below 50 needs significant improvement.
2.  **assessment**: A concise qualitative assessment based on the score (e.g., "Excellent Fit", "Good Fit", "Fair Match", "Needs Significant Improvement").
3.  **reasoning**: A brief (2-3 sentences) explanation for the score. Highlight major strengths and weaknesses of the resume concerning the JD.
4.  **keyMatches**: A list (array of strings) of 3-5 specific skills, experiences, or qualifications from the resume that strongly align with the job description's requirements.
5.  **keyMismatches**: A list (array of strings) of 3-5 critical skills or qualifications explicitly required by the job description that are missing, not clearly stated, or underdeveloped in the resume. These are skill gaps.
6.  **courseRecommendations**: (Only if fitmentScore is below 70)
    *   Provide 1-3 course recommendations to help bridge the identified 'keyMismatches' (skill gaps).
    *   Each course recommendation MUST include:
        *   'title': A plausible course title.
        *   'platform': The platform (e.g., Coursera, Udemy, LinkedIn Learning, edX).
        *   'description': Why this course is relevant for the skill gap.
        *   'url' (optional): A plausible URL (search or direct).
        *   'focusArea' (optional): The primary skill the course addresses.
    *   If fitmentScore is 70 or above, this array should be empty or omitted.

Candidate Resume:
{{media url=resumeDataUri}}

Job Description:
{{{jobDescriptionText}}}

Focus on objective evidence from the resume. Do not infer skills not explicitly mentioned or strongly implied by experience.
Output the entire response as a single JSON object.
`,
});

const recruiterMatchFlow = ai.defineFlow(
  {
    name: 'recruiterMatchFlow',
    inputSchema: RecruiterMatchInputSchema,
    outputSchema: RecruiterMatchOutputSchema,
  },
  async (input) => {
    const { output } = await recruiterMatcherPrompt(input);

    // Ensure courseRecommendations is an empty array if score is >= 70 and it was provided
    if (output && output.fitmentScore >= 70 && output.courseRecommendations && output.courseRecommendations.length > 0) {
      output.courseRecommendations = [];
    }
    // Ensure courseRecommendations array exists if undefined and score is < 70 (though schema should handle this if prompt fails)
    if (output && output.fitmentScore < 70 && output.courseRecommendations === undefined) {
        output.courseRecommendations = [];
    }
    
    // Ensure keyMatches and keyMismatches are arrays
    if (output) {
        output.keyMatches = output.keyMatches || [];
        output.keyMismatches = output.keyMismatches || [];
        if (output.courseRecommendations) {
             output.courseRecommendations = output.courseRecommendations.map(rec => ({
                title: rec.title || "Untitled Course Recommendation",
                platform: rec.platform || "Unknown Platform",
                description: rec.description || "No description provided.",
                ...rec
            }));
        } else {
            output.courseRecommendations = [];
        }
    }


    return output!;
  }
);
