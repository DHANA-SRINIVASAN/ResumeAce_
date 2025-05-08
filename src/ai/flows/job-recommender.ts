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
import {z}from 'genkit';
import type { GenerateResponseData } from 'genkit/generate'; // Correct type for prompt output

const JobRecommenderInputSchema = z.object({
  skills: z.array(z.string()).describe('A list of skills from the resume.'),
  experienceSummary: z.string().describe('A summary of the work experience from the resume.'),
  targetRole: z.string().optional().describe('A specific target role the user might be interested in.'),
});
export type JobRecommenderInput = z.infer<typeof JobRecommenderInputSchema>;

const RecommendedJobSchemaRequired = z.object({
  title: z.string().describe('The job title. This field is absolutely mandatory for every job recommendation.'),
  company: z.string().describe('The hiring company name. This field is mandatory.'),
  description: z.string().describe('A brief description of why this job is a good fit for the candidate based on their resume. This field is mandatory.'),
  relevanceScore: z.number().min(0).max(1).describe('A score from 0.0 to 1.0 indicating the relevance of this job to the resume. This field is mandatory.'),
  suggestedSearchLinks: z.object({
    linkedIn: z.string().optional().describe("A suggested search URL for finding similar jobs on LinkedIn. Example: 'https://www.linkedin.com/jobs/search/?keywords=Software%20Engineer%20Remote'"),
    naukri: z.string().optional().describe("A suggested search URL for finding similar jobs on Naukri. Example: 'https://www.naukri.com/software-engineer-jobs-in-bangalore'"),
    indeed: z.string().optional().describe("A suggested search URL for finding similar jobs on Indeed. Example: 'https://in.indeed.com/jobs?q=data+analyst&l=Mumbai'"),
    glassdoor: z.string().optional().describe("A suggested search URL for finding similar jobs on Glassdoor. Example: 'https://www.glassdoor.co.in/Job/software-engineer-jobs-SRCH_KO0,17.htm'")
  }).describe("Suggested search URLs for popular job platforms. This object is mandatory.")
});
// Make all fields in RecommendedJobSchema optional for initial parsing from LLM, then enforce in post-processing
const RecommendedJobSchemaLax = RecommendedJobSchemaRequired.partial();


const JobRecommenderOutputSchema = z.object({
  jobs: z.array(RecommendedJobSchemaRequired).describe('A list of 3-5 recommended jobs.'),
});
export type JobRecommenderOutput = z.infer<typeof JobRecommenderOutputSchema>;
export type RecommendedJob = z.infer<typeof RecommendedJobSchemaRequired>;


export async function getJobRecommendations(input: JobRecommenderInput): Promise<JobRecommenderOutput> {
  return jobRecommenderFlow(input);
}

// Define the prompt with a potentially laxer output schema for LLM response, then validate/clean in flow
const jobRecommenderPrompt = ai.definePrompt({
  name: 'jobRecommenderPrompt',
  input: {schema: JobRecommenderInputSchema},
  output: {schema: z.object({jobs: z.array(RecommendedJobSchemaLax)})}, // Use lax schema for LLM output
  prompt: `You are an expert career advisor and job recommender. Based on the following resume details, suggest 3-5 job roles.
For each and every job role, you MUST provide:
1.  A plausible job title (the 'title' field). This is an absolutely critical and mandatory field. Without a title, the recommendation is useless.
2.  A plausible company name (the 'company' field). This is mandatory.
3.  A brief description (1-2 sentences) explaining why this job is a good fit for the candidate, referencing their skills and experience (the 'description' field). This is mandatory.
4.  A relevance score (a number between 0.0 and 1.0) indicating how relevant this job is to the provided resume details (the 'relevanceScore' field). This is mandatory.
5.  Suggested search URLs for finding similar jobs on LinkedIn, Naukri, Indeed, and Glassdoor (the 'suggestedSearchLinks' object with its respective string fields). These URLs should be functional search queries. For example, for LinkedIn: 'https://www.linkedin.com/jobs/search/?keywords=TITLE%20COMPANY&location=REGION' or similar constructive search links. This 'suggestedSearchLinks' object is mandatory.

Resume Details:
Skills: {{#each skills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
Experience Summary: {{{experienceSummary}}}
{{#if targetRole}}Target Role Preference: {{{targetRole}}}{{/if}}

Generate recommendations that are diverse and cover different potential career paths if applicable.
Ensure ALL required fields, especially 'title', 'company', 'description', 'relevanceScore', and 'suggestedSearchLinks', are present for *every* job object in the 'jobs' array.
The output must strictly adhere to the JSON schema, paying close attention to required fields for each job object. The 'title' field is paramount.
`,
});

const jobRecommenderFlow = ai.defineFlow(
  {
    name: 'jobRecommenderFlow',
    inputSchema: JobRecommenderInputSchema,
    outputSchema: JobRecommenderOutputSchema, // Flow's final output must adhere to the strict schema
  },
  async (input): Promise<JobRecommenderOutput> => {
    const llmResponse = await jobRecommenderPrompt(input);
    const rawOutput = llmResponse.output;

    if (!rawOutput || !rawOutput.jobs) {
      const firstCandidateMessageContent = llmResponse.candidates?.[0]?.message?.content?.[0];
      const errorDetails = firstCandidateMessageContent?.data ?? firstCandidateMessageContent?.text ?? "No detailed error message available from LLM.";
      
      console.error(
        "JobRecommenderFlow: Schema validation failed or LLM returned no/invalid jobs array. LLM response content:",
        JSON.stringify(errorDetails).substring(0, 1000) // Log more details if available
      );
      // Include original error if available in llmResponse, for more context
      if (llmResponse.error) {
        console.error("JobRecommenderFlow: Underlying Genkit error:", llmResponse.error);
      }
      return { jobs: [] }; // Return a valid default structure
    }
    
    const processedJobs: RecommendedJob[] = [];

    for (const job of rawOutput.jobs) {
      const currentJob = job || {}; // Handle case where a job object in the array might be null

      const title = (currentJob.title && currentJob.title.trim() !== "") ? currentJob.title.trim() : null;
      
      // If title is missing or empty, skip this job entry entirely.
      if (!title) {
        console.warn("JobRecommenderFlow: Skipping job due to missing or empty title.", currentJob);
        continue;
      }

      const company = (currentJob.company && currentJob.company.trim() !== "") ? currentJob.company.trim() : "Unknown Company";
      const description = (currentJob.description && currentJob.description.trim() !== "") ? currentJob.description.trim() : "No description provided.";
      const relevanceScore = (typeof currentJob.relevanceScore === 'number' && currentJob.relevanceScore >= 0 && currentJob.relevanceScore <= 1) ? currentJob.relevanceScore : 0;
      
      const defaultSearchLinks = {
        linkedIn: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(title)}`,
        naukri: `https://www.naukri.com/jobs-in-india?k=${encodeURIComponent(title)}`,
        indeed: `https://indeed.com/jobs?q=${encodeURIComponent(title)}`,
        glassdoor: `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${encodeURIComponent(title)}`
      };
      
      const currentLinks = currentJob.suggestedSearchLinks || {};

      processedJobs.push({
        title,
        company,
        description,
        relevanceScore,
        suggestedSearchLinks: {
            linkedIn: currentLinks.linkedIn || defaultSearchLinks.linkedIn,
            naukri: currentLinks.naukri || defaultSearchLinks.naukri,
            indeed: currentLinks.indeed || defaultSearchLinks.indeed,
            glassdoor: currentLinks.glassdoor || defaultSearchLinks.glassdoor,
        },
      });
    }
    
    return { jobs: processedJobs };
  }
);

