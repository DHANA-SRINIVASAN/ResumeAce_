// src/ai/flows/job-recommender.ts
'use server';
/**
 * @fileOverview Generates job recommendations based on resume analysis.
 *
 * - getJobRecommendations - A function that handles the job recommendation process.
 * - JobRecommenderInput - The input type for the getJobRecommendations function.
 * - JobRecommenderOutput - The return type for the getJobRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const JobRecommenderInputSchema = z.object({
  skills: z.array(z.string()).describe('A list of skills from the resume.'),
  experienceSummary: z.string().describe('A summary of the work experience from the resume.'),
  targetRole: z.string().optional().describe('A specific target role the user might be interested in.'),
});
export type JobRecommenderInput = z.infer<typeof JobRecommenderInputSchema>;

const RecommendedJobSchema = z.object({
  title: z.string().describe('The job title. This field is absolutely mandatory for every job.'),
  company: z.string().describe('The hiring company name.'),
  description: z.string().describe('A brief description of why this job is a good fit for the candidate based on their resume.'),
  relevanceScore: z.number().min(0).max(1).describe('A score from 0.0 to 1.0 indicating the relevance of this job to the resume.'),
  suggestedSearchLinks: z.object({
    linkedIn: z.string().optional().describe("A suggested search URL for finding similar jobs on LinkedIn. Example: 'https://www.linkedin.com/jobs/search/?keywords=Software%20Engineer%20Remote'"),
    naukri: z.string().optional().describe("A suggested search URL for finding similar jobs on Naukri. Example: 'https://www.naukri.com/software-engineer-jobs-in-bangalore'"),
    indeed: z.string().optional().describe("A suggested search URL for finding similar jobs on Indeed. Example: 'https://in.indeed.com/jobs?q=data+analyst&l=Mumbai'"),
    glassdoor: z.string().optional().describe("A suggested search URL for finding similar jobs on Glassdoor. Example: 'https://www.glassdoor.co.in/Job/software-engineer-jobs-SRCH_KO0,17.htm'")
  }).describe("Suggested search URLs for popular job platforms.")
});

const JobRecommenderOutputSchema = z.object({
  jobs: z.array(RecommendedJobSchema).describe('A list of 3-5 recommended jobs.'),
});
export type JobRecommenderOutput = z.infer<typeof JobRecommenderOutputSchema>;
export type RecommendedJob = z.infer<typeof RecommendedJobSchema>;


export async function getJobRecommendations(input: JobRecommenderInput): Promise<JobRecommenderOutput> {
  return jobRecommenderFlow(input);
}

const jobRecommenderPrompt = ai.definePrompt({
  name: 'jobRecommenderPrompt',
  input: {schema: JobRecommenderInputSchema},
  output: {schema: JobRecommenderOutputSchema},
  prompt: `You are an expert career advisor and job recommender. Based on the following resume details, suggest 3-5 job roles.
For each and every job role, you MUST provide:
1.  A plausible job title (the 'title' field). This is a critical and mandatory field.
2.  A plausible company name (the 'company' field).
3.  A brief description (1-2 sentences) explaining why this job is a good fit for the candidate, referencing their skills and experience (the 'description' field).
4.  A relevance score (a number between 0.0 and 1.0) indicating how relevant this job is to the provided resume details (the 'relevanceScore' field).
5.  Suggested search URLs for finding similar jobs on LinkedIn, Naukri, Indeed, and Glassdoor (the 'suggestedSearchLinks' object with its respective string fields). These URLs should be functional search queries. For example, for LinkedIn: 'https://www.linkedin.com/jobs/search/?keywords=TITLE%20COMPANY&location=REGION' or similar constructive search links.

Resume Details:
Skills: {{#each skills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
Experience Summary: {{{experienceSummary}}}
{{#if targetRole}}Target Role Preference: {{{targetRole}}}{{/if}}

Generate recommendations that are diverse and cover different potential career paths if applicable.
Ensure all required fields, especially 'title', 'company', 'description', 'relevanceScore', and 'suggestedSearchLinks', are present for *every* job object in the 'jobs' array.
The output must strictly adhere to the JSON schema, paying close attention to required fields for each job object.
`,
});

const jobRecommenderFlow = ai.defineFlow(
  {
    name: 'jobRecommenderFlow',
    inputSchema: JobRecommenderInputSchema,
    outputSchema: JobRecommenderOutputSchema,
  },
  async (input) => {
    const {output} = await jobRecommenderPrompt(input);
    return output!;
  }
);

