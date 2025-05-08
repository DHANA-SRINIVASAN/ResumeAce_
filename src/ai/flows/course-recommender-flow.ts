// src/ai/flows/course-recommender-flow.ts
'use server';
/**
 * @fileOverview Generates course recommendations based on current skills, gaps, and target role.
 *
 * - getCourseRecommendations - A function that handles the course recommendation process.
 * - CourseRecommenderInput - The input type for the function.
 * - CourseRecommenderOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CourseRecommenderInputSchema = z.object({
  currentSkills: z.array(z.string()).describe('A list of current skills from the resume.'),
  targetRole: z.string().describe('The target job role the user is aiming for.'),
  skillGaps: z.array(z.string()).optional().describe('Identified skill gaps for the target role. This is very helpful for targeted recommendations.'),
  areasForImprovement: z.array(z.string()).optional().describe('General areas where the resume or skills could be improved.'),
});
export type CourseRecommenderInput = z.infer<typeof CourseRecommenderInputSchema>;

const RecommendedCourseSchema = z.object({
  title: z.string().describe('The title of the recommended course or learning path. This field is absolutely mandatory.'),
  platform: z.string().describe('The platform offering the course (e.g., Coursera, Udemy, edX, YouTube Channel Name, official documentation site). This field is mandatory.'),
  description: z.string().describe('A brief description of why this course is relevant based on skills, gaps, or target role.'),
  url: z.string().optional().describe('A direct or search URL for the course. Example for Coursera: "https://www.coursera.org/search?query=Machine%20Learning" or a specific course URL if known.'),
  focusArea: z.string().optional().describe("The primary skill or area this course addresses (e.g., 'Python', 'Data Analysis', 'Project Management')."),
});

const CourseRecommenderOutputSchema = z.object({
  recommendations: z.array(RecommendedCourseSchema).describe('A list of 3-5 recommended courses or learning resources.'),
  generalAdvice: z.string().optional().describe("General advice on how to approach learning for the target role."),
});
export type CourseRecommenderOutput = z.infer<typeof CourseRecommenderOutputSchema>;
export type RecommendedCourse = z.infer<typeof RecommendedCourseSchema>;


export async function getCourseRecommendations(input: CourseRecommenderInput): Promise<CourseRecommenderOutput> {
  return courseRecommenderFlow(input);
}

const courseRecommenderPrompt = ai.definePrompt({
  name: 'courseRecommenderPrompt',
  input: {schema: CourseRecommenderInputSchema},
  output: {schema: CourseRecommenderOutputSchema},
  prompt: `You are an expert AI career advisor and learning strategist.
Based on the user's current skills, target role, and any identified skill gaps or areas for improvement, suggest 3-5 relevant courses or learning resources.
For each recommendation, you MUST provide:
1.  A plausible course title (the 'title' field). This is a critical and mandatory field.
2.  The platform where it can be found (e.g., Coursera, Udemy, edX, Khan Academy, YouTube, specific documentation sites) (the 'platform' field). This is mandatory.
3.  A brief description (1-2 sentences) explaining its relevance (the 'description' field).
4.  A URL (direct or search query) for the course/resource (the 'url' field).
5.  The focus area or skill this course addresses (the 'focusArea' field).

User's Profile:
Current Skills: {{#if currentSkills}}{{#each currentSkills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}Not specified{{/if}}
Target Role: {{{targetRole}}}
{{#if skillGaps}}Identified Skill Gaps: {{#each skillGaps}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{/if}}
{{#if areasForImprovement}}Areas for General Improvement: {{#each areasForImprovement}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{/if}}

Prioritize resources that are well-regarded. If suggesting a platform like YouTube, mention specific channel types or search terms if a specific course isn't obvious.
Also, provide some general advice on approaching learning for the target role.
Ensure all required fields ('title', 'platform', 'description') are present for *every* course object in the 'recommendations' array.
The output must strictly adhere to the JSON schema.
`,
});

const courseRecommenderFlow = ai.defineFlow(
  {
    name: 'courseRecommenderFlow',
    inputSchema: CourseRecommenderInputSchema,
    outputSchema: CourseRecommenderOutputSchema,
  },
  async (input) => {
    const {output} = await courseRecommenderPrompt(input);
    // Ensure recommendations array and its items have mandatory fields.
    if (output && output.recommendations) {
        output.recommendations = output.recommendations.map(rec => ({
            title: rec.title || "Untitled Course Recommendation",
            platform: rec.platform || "Unknown Platform",
            description: rec.description || "No description provided.",
            ...rec
        }));
    } else if (output) {
        output.recommendations = [];
    }
    return output!;
  }
);
