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
import type { GenerateResponseData } from 'genkit/generate'; 

const JobRecommenderInputSchema = z.object({
  skills: z.array(z.string()).describe('A list of skills from the resume.'),
  experienceSummary: z.string().describe('A summary of the work experience from the resume.'),
  projectsSummary: z.array(z.string()).optional().describe('A list of project descriptions from the resume, which can highlight practical application of skills.'),
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
const RecommendedJobSchemaLax = RecommendedJobSchemaRequired.partial();


const JobRecommenderOutputSchema = z.object({
  jobs: z.array(RecommendedJobSchemaRequired).describe('A list of 3-5 recommended jobs.'),
});
export type JobRecommenderOutput = z.infer<typeof JobRecommenderOutputSchema>;
export type RecommendedJob = z.infer<typeof RecommendedJobSchemaRequired>;


export async function getJobRecommendations(input: JobRecommenderInput): Promise<JobRecommenderOutput> {
  return jobRecommenderFlow(input);
}

const jobRecommenderPrompt = ai.definePrompt({
  name: 'jobRecommenderPrompt',
  input: {schema: JobRecommenderInputSchema},
  output: {schema: z.object({jobs: z.array(RecommendedJobSchemaLax)})}, 
  prompt: `You are an expert career advisor and job recommender. Your primary goal is to provide highly relevant job suggestions based *directly* on the candidate's resume details.

First, carefully analyze the provided Resume Details (Skills, Experience Summary, and Projects Summary). Identify the 2-3 most prominent skills, technologies, or experience areas mentioned.

Then, based on these *identified prominent areas*, suggest 3-5 job roles. For each and every job role, you MUST provide:
1.  A plausible job title (the 'title' field). This title *must directly reflect* the candidate's primary skills and experience. For example, if the resume highlights "Python, Django, and API development," a relevant title would be "Python Django Developer" or "Backend API Engineer," not a generic "Software Engineer" unless that's the best fit given extensive experience. This is an absolutely critical and mandatory field. Without a title clearly aligned with the resume's core strengths, the recommendation is useless. If you cannot confidently generate a valid, non-empty, and *relevant* title, omit that entire job entry.
2.  A plausible company name (the 'company' field). This is mandatory. You can suggest well-known companies or generic but realistic company names (e.g., "Innovatech Solutions", "DataDriven Corp").
3.  A brief description (1-2 sentences) explaining *specifically* why this job is a good fit for the candidate. This description MUST explicitly reference the candidate's skills and experience from their resume and connect them to the job's requirements. For example: "This Backend Developer role at Innovatech Solutions is a strong match due to your listed proficiency in Python, Django, and experience in building RESTful APIs, as detailed in your project work." This field is mandatory.
4.  A relevance score (a number between 0.0 and 1.0) indicating how relevant *this specific job title and description* are to the *provided resume details*. A score of 1.0 means a perfect match for the resume's core strengths. This field is mandatory.
5.  Suggested search URLs for finding similar jobs on LinkedIn, Naukri, Indeed, and Glassdoor (the 'suggestedSearchLinks' object with its respective string fields). These URLs should be functional search queries based on the *specific job title and potentially key skills*. For example, for LinkedIn: 'https://www.linkedin.com/jobs/search/?keywords=Python%20Django%20Developer&location=REMOTE' or similar constructive search links. This 'suggestedSearchLinks' object is mandatory. Even if specific links are hard to generate, provide valid default search query URLs for each platform based on the job title.

Resume Details:
Skills: {{#if skills}}{{#each skills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}No specific skills listed.{{/if}}
Experience Summary: {{{experienceSummary}}}
{{#if projectsSummary}}
Projects Summary:
{{#each projectsSummary}}
- {{{this}}}
{{/each}}
{{/if}}
{{#if targetRole}}Target Role Preference (consider this, but prioritize direct resume alignment): {{{targetRole}}}{{/if}}

Generate recommendations that are diverse if the resume supports multiple paths, but always prioritize direct relevance to the resume's content.
Ensure ALL required fields, especially 'title', 'company', 'description', 'relevanceScore', and 'suggestedSearchLinks', are present for *every* job object in the 'jobs' array.
The output must strictly adhere to the JSON schema, paying close attention to required fields for each job object. The 'title' and 'description' relevance is paramount.
Do not include job entries if they lack a valid 'title' or a description that clearly links to the resume content.
`,
});

const jobRecommenderFlow = ai.defineFlow(
  {
    name: 'jobRecommenderFlow',
    inputSchema: JobRecommenderInputSchema,
    outputSchema: JobRecommenderOutputSchema, 
  },
  async (input): Promise<JobRecommenderOutput> => {
    const llmResponse = await jobRecommenderPrompt(input);
    const rawOutput = llmResponse.output;


    if (!rawOutput || !rawOutput.jobs) {
      const firstCandidateMessageContent = llmResponse.candidates?.[0]?.message?.content?.[0];
      const errorDetails = firstCandidateMessageContent?.data ?? firstCandidateMessageContent?.text ?? "No detailed error message available from LLM.";
      
      console.error(
        "JobRecommenderFlow: Schema validation failed or LLM returned no/invalid jobs array. LLM response content:",
        JSON.stringify(errorDetails).substring(0, 1000) 
      );
      if (llmResponse.error) {
        console.error("JobRecommenderFlow: Underlying Genkit error:", llmResponse.error);
      }
      return { jobs: [] }; 
    }
    
    const processedJobs: RecommendedJob[] = [];

    for (const job of rawOutput.jobs) {
      const currentJob = job || {}; 

      const title = (currentJob.title && currentJob.title.trim() !== "") ? currentJob.title.trim() : null;
      
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
