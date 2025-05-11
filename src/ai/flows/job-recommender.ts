// src/ai/flows/job-recommender.ts
'use server';
/**
 * @fileOverview Generates job recommendations based on resume analysis from multiple specified platforms.
 *
 * - getJobRecommendations - A function that handles the job recommendation process.
 * - JobRecommenderInput - The input type for the getJobRecommendations function.
 * - JobRecommenderOutput - The return type for the getJobRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z}from 'genkit';

const JobRecommenderInputSchema = z.object({
  skills: z.array(z.string()).describe('A list of skills from the resume.'),
  experienceSummary: z.string().describe('A summary of the work experience from the resume, especially the most recent experience.'),
  projectsSummary: z.array(z.string()).optional().describe('A list of project descriptions from the resume, which can highlight practical application of skills.'),
  targetRole: z.string().optional().describe('A specific target role the user might be interested in.'),
});
export type JobRecommenderInput = z.infer<typeof JobRecommenderInputSchema>;

const RecommendedJobSchemaRequired = z.object({
  title: z.string().describe('The job title. This field is absolutely mandatory.'),
  company: z.string().describe('The hiring company name. This field is mandatory.'),
  location: z.string().describe('The job location. Prioritize locations in India like Chennai, Bangalore, Hyderabad, Coimbatore, and Trichy if applicable, or as indicated by resume. This field is mandatory.'),
  keyRequiredSkills: z.array(z.string()).describe('A list of 3-5 key skills required for the job, directly from the job posting if possible. This field is mandatory.'),
  description: z.string().describe('A short job description (2-3 sentences) summarizing the role and its key responsibilities. This field is mandatory.'),
  applicationLink: z.string().describe('A direct application link for the job. This field is mandatory.'),
  matchScore: z.number().min(0).max(100).describe('A score from 0 to 100 indicating how well the job aligns with the candidate’s skills and experience. This field is mandatory.'),
  platform: z.string().describe('The platform where the job was found (e.g., LinkedIn, Naukri, Indeed, SimplyHired, Glassdoor). This field is mandatory.'),
});
const RecommendedJobSchemaLax = RecommendedJobSchemaRequired.partial();


const JobRecommenderOutputSchema = z.object({
  jobs: z.array(RecommendedJobSchemaRequired).min(0).max(10).describe('A list of up to 10 recommended jobs (aiming for at least 5). Prioritize jobs that closely match the candidate’s most recent experience and top skills. Locations in India like Chennai, Bangalore, Hyderabad, Coimbatore, and Trichy should be considered if relevant. Match score should be 50% or higher for inclusion. If no jobs meet the criteria, return an empty array.'),
});
export type JobRecommenderOutput = z.infer<typeof JobRecommenderOutputSchema>;
export type RecommendedJob = z.infer<typeof RecommendedJobSchemaRequired>;


export async function getJobRecommendations(input: JobRecommenderInput): Promise<JobRecommenderOutput> {
  return jobRecommenderFlow(input);
}

const jobRecommenderPrompt = ai.definePrompt({
  name: 'jobRecommenderPrompt',
  input: {schema: JobRecommenderInputSchema},
  output: {schema: z.object({jobs: z.array(RecommendedJobSchemaLax).min(0)})}, 
  prompt: `You are a job recommendation assistant.
Given the following resume details, first extract relevant skills, experience, and job roles.
Then fetch or generate at least 5 job recommendations from publicly available job portals (like LinkedIn, Indeed, Glassdoor, or SimplyHired) that closely match the candidate’s profile.
Prioritize jobs that closely match the candidate’s most recent experience and top skills.
Prioritize jobs located in India, specifically in cities like Chennai, Bangalore, Hyderabad, Coimbatore, and Trichy, if these align with the profile or are generally suitable.

Each recommendation MUST include:
- Job Title
- Company Name
- Location (this field is mandatory)
- Required Skills (a list of 3-5 key skills directly from the job posting if possible)
- Short Job Description (2-3 sentences summarizing the role and its key responsibilities)
- Match Score (a percentage from 0 to 100, indicating how well the job aligns with the candidate’s skills and experience. This score should be 50% or higher for inclusion.)
- Direct Job Link (real or dummy if scraping is not active, ensure it's a valid URL format)
- Platform (The name of the job portal where this job was sourced, e.g., LinkedIn, Indeed, Glassdoor, SimplyHired)

Resume Details:
Top Skills: {{#if skills}}{{#each skills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}No specific skills listed.{{/if}}
Most Recent Experience Summary: {{{experienceSummary}}}
{{#if projectsSummary}}
Projects Summary (if relevant):
{{#each projectsSummary}}
- {{{this}}}
{{/each}}
{{/if}}
{{#if targetRole}}
User's Stated Target Role (consider this but prioritize resume content): {{{targetRole}}}
{{/if}}

Output strictly in the defined JSON schema. Only include jobs if you can provide all mandatory fields and the match score is 50% or higher.
If, due to sparse resume details or lack of suitable matches, you cannot find at least 5 jobs meeting these criteria, it is acceptable to return fewer high-quality jobs, or an empty 'jobs' array.
The number of jobs should ideally be between 5 and 10.
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
      const logMessage = !rawOutput?.jobs ? "LLM returned no/invalid jobs array or structure." : "LLM processing resulted in no jobs data.";
      
      console.warn(
        `JobRecommenderFlow: ${logMessage} LLM response details (if problematic):`,
        JSON.stringify(firstCandidateMessageContent?.data ?? firstCandidateMessageContent?.text ?? "No detailed error message available from LLM.").substring(0, 1000) 
      );
      if (llmResponse.error) {
        console.error("JobRecommenderFlow: Underlying Genkit error:", llmResponse.error);
      }
      return { jobs: [] }; 
    }
    
    if (rawOutput.jobs.length === 0) {
        console.info("JobRecommenderFlow: LLM returned an empty jobs array. This may be expected for profiles with sparse skills or no suitable matches found by the LLM.");
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
      
      const location = (currentJob.location && currentJob.location.trim() !== "") ? currentJob.location.trim() : null;
       if (!location) {
        console.warn(`JobRecommenderFlow: Skipping job "${title}" due to missing or empty location.`);
        continue; 
      }
      
      const keyRequiredSkills = Array.isArray(currentJob.keyRequiredSkills) && currentJob.keyRequiredSkills.length > 0 
                                ? currentJob.keyRequiredSkills.map(s => String(s).trim()).filter(s => s) 
                                : ["Skill not specified"];
      
      const description = (currentJob.description && currentJob.description.trim() !== "") ? currentJob.description.trim() : "No description provided.";
      
      let applicationLink = (currentJob.applicationLink && currentJob.applicationLink.trim() !== "") ? currentJob.applicationLink.trim() : `https://www.google.com/search?q=${encodeURIComponent(title + " " + company + " " + location)}`;
      try {
        if (!applicationLink.startsWith('http://') && !applicationLink.startsWith('https://')) {
            if (applicationLink.includes('.')) { 
                applicationLink = 'https://' + applicationLink;
            } else {
                 throw new Error("Invalid URL format, cannot auto-correct.");
            }
        }
        new URL(applicationLink); 
      } catch (_) {
        console.warn(`JobRecommenderFlow: Invalid applicationLink "${applicationLink}" for job "${title}". Defaulting to Google search.`);
        applicationLink = `https://www.google.com/search?q=${encodeURIComponent(title + " " + company + " " + location)}`;
      }
      
      const matchScore = (typeof currentJob.matchScore === 'number' && currentJob.matchScore >= 0 && currentJob.matchScore <= 100) ? currentJob.matchScore : 0;
      
      if (matchScore < 50) {
        console.warn(`JobRecommenderFlow: Skipping job "${title}" due to match score ${matchScore} < 50.`);
        continue;
      }

      const platform = (currentJob.platform && currentJob.platform.trim() !== "") ? currentJob.platform.trim() : "Unknown Platform";

      processedJobs.push({
        title,
        company,
        location,
        keyRequiredSkills,
        description,
        applicationLink,
        matchScore,
        platform,
      });
    }
    
    // Ensure the final list adheres to the max limit defined in JobRecommenderOutputSchema (e.g. max 10)
    const finalJobs = processedJobs.slice(0, JobRecommenderOutputSchema.shape.jobs.maxLength || 10); 

    return { jobs: finalJobs };
  }
);

