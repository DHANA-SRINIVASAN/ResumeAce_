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
  location: z.string().optional().describe('The job location. Prioritize locations in India like Chennai, Bangalore, Hyderabad, Coimbatore, and Trichy if applicable, or as indicated by resume.'),
  keyRequiredSkills: z.array(z.string()).describe('A list of 3-5 key skills required for the job, directly from the job posting if possible. This field is mandatory.'),
  description: z.string().describe('A short job description (2-3 sentences) summarizing the role and its key responsibilities. This field is mandatory.'),
  applicationLink: z.string().describe('A direct application link for the job. This field is mandatory.'),
  matchScore: z.number().min(0).max(100).describe('A score from 0 to 100 indicating how well the job aligns with the candidate’s skills and experience. This field is mandatory.'),
  platform: z.string().describe('The platform where the job was found (e.g., LinkedIn, Naukri, Indeed, SimplyHired, Glassdoor). This field is mandatory.'),
});
const RecommendedJobSchemaLax = RecommendedJobSchemaRequired.partial();


const JobRecommenderOutputSchema = z.object({
  jobs: z.array(RecommendedJobSchemaRequired).min(0).max(20).describe('A list of up to 15-20 recommended jobs (aiming for 3 from each specified platform). Prioritize jobs that closely match the candidate’s most recent experience and top skills. Locations in India like Chennai, Bangalore, Hyderabad, Coimbatore, and Trichy should be considered if relevant. Match score should be 50% or higher for inclusion. If no jobs meet the criteria, return an empty array.'),
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
  prompt: `You are an expert AI career advisor and job recommender.
Analyze the candidate's resume details (skills, most recent experience, projects). Based on this, recommend relevant job openings.
You MUST provide 3 job recommendations from EACH of the following platforms:
- LinkedIn
- Naukri
- Indeed
- SimplyHired
- Glassdoor
This should result in a total of 15 job recommendations.

Prioritize jobs that closely match the candidate’s most recent experience and top skills, and have a match score of 50% or higher.
Prioritize jobs located in India, specifically in cities like Chennai, Bangalore, Hyderabad, Coimbatore, and Trichy, if these align with the profile or are generally suitable.

For each job recommendation, you MUST provide:
1.  **Job Title**: (e.g., "Software Engineer", "Data Analyst"). This field is absolutely critical and mandatory.
2.  **Company Name**: (e.g., "Tech Solutions Inc.", "Google"). This field is mandatory.
3.  **Location**: (e.g., "Chennai, India", "Remote"). This field is mandatory.
4.  **Key Required Skills**: A list of 3-5 key skills explicitly mentioned in the job requirements (e.g., ["Python", "SQL", "AWS"]). This field is mandatory.
5.  **Short Job Description**: A concise summary (2-3 sentences) of the job's main responsibilities and purpose. This field is mandatory.
6.  **Application Link**: A direct, functional URL to the job application page. This field is mandatory and must be a valid URL.
7.  **Match Score**: A percentage (0-100) representing the alignment of the job with the candidate's skills and experience (especially recent experience). This field is mandatory. Ensure this score is 50 or higher.
8.  **Platform**: The name of the job platform from which this job was sourced (LinkedIn, Naukri, Indeed, SimplyHired, or Glassdoor). This field is mandatory.

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

Focus on providing high-quality, actionable recommendations. Ensure all fields are populated correctly.
Output strictly in the defined JSON schema. Only include jobs if you can provide all mandatory fields and the match score is 50% or higher.
Aim for a total of 15 job recommendations. If finding 3 suitable jobs (match score >= 50%) from a specific platform is exceptionally difficult, provide as many as possible for that platform, but ensure diversity and relevance in the overall set of jobs.
If skills are very sparse or not clearly defined in the resume, and you cannot meet the 50% match score or find sufficient jobs, it is acceptable to return a smaller number of high-quality jobs, or an empty 'jobs' array if no suitable matches are found.
The number of jobs should be ideally 15.
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
      const location = (currentJob.location && currentJob.location.trim() !== "") ? currentJob.location.trim() : "Unknown Location";
      
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
    
    // Aim for up to 15 jobs, but LLM might return more or less based on prompt.
    // Max specified in output schema is 20, so slice to 15 if more are valid.
    const finalJobs = processedJobs.slice(0, 15); 

    return { jobs: finalJobs };
  }
);
