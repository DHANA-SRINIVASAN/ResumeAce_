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
  applicationLink: z.string().describe('A direct application link for the job, preferably from LinkedIn, Indeed, Naukri, or SimplyHired. This field is mandatory.'),
  matchScore: z.number().min(0).max(100).describe('A score from 0 to 100 indicating how well the job aligns with the candidate’s skills and experience. This field is mandatory.'),
});
const RecommendedJobSchemaLax = RecommendedJobSchemaRequired.partial();


const JobRecommenderOutputSchema = z.object({
  jobs: z.array(RecommendedJobSchemaRequired).min(0).max(10).describe('A list of up to 10 recommended jobs. Prioritize jobs that closely match the candidate’s most recent experience and top skills. Locations in India like Chennai, Bangalore, Hyderabad, Coimbatore, and Trichy should be considered if relevant. Match score should be 50% or higher for inclusion. If no jobs meet the criteria, return an empty array.'),
});
export type JobRecommenderOutput = z.infer<typeof JobRecommenderOutputSchema>;
export type RecommendedJob = z.infer<typeof RecommendedJobSchemaRequired>;


export async function getJobRecommendations(input: JobRecommenderInput): Promise<JobRecommenderOutput> {
  return jobRecommenderFlow(input);
}

const jobRecommenderPrompt = ai.definePrompt({
  name: 'jobRecommenderPrompt',
  input: {schema: JobRecommenderInputSchema},
  output: {schema: z.object({jobs: z.array(RecommendedJobSchemaLax).min(0)})}, // Allow empty array from LLM, min 0
  prompt: `You are an expert AI career advisor and job recommender.
Analyze the candidate's resume details (skills, most recent experience, projects). Based on this, recommend up to 10 relevant job openings. Prioritize jobs that closely match the candidate’s most recent experience and top skills, and have a match score of 50% or higher.
Prioritize jobs located in India, specifically in cities like Chennai, Bangalore, Hyderabad, Coimbatore, and Trichy, if these align with the profile or are generally suitable.

For each job recommendation, you MUST provide:
1.  **Job Title**: (e.g., "Software Engineer", "Data Analyst"). This field is absolutely critical and mandatory.
2.  **Company Name**: (e.g., "Tech Solutions Inc.", "Google"). This field is mandatory.
3.  **Location**: (e.g., "Chennai, India", "Remote"). This field is mandatory.
4.  **Key Required Skills**: A list of 3-5 key skills explicitly mentioned in the job requirements (e.g., ["Python", "SQL", "AWS"]). This field is mandatory.
5.  **Short Job Description**: A concise summary (2-3 sentences) of the job's main responsibilities and purpose. This field is mandatory.
6.  **Application Link**: A direct, functional URL to the job application page, preferably from LinkedIn, Indeed, Naukri, or SimplyHired. This field is mandatory and must be a valid URL.
7.  **Match Score**: A percentage (0-100) representing the alignment of the job with the candidate's skills and experience (especially recent experience). This field is mandatory. Ensure this score is 50 or higher.

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

Focus on providing high-quality, actionable recommendations. Ensure all fields are populated correctly. If a suitable application link from LinkedIn, Indeed, Naukri, or SimplyHired cannot be found, you may use a general careers page link for the company if a specific role matching the description is likely listed there, but prioritize direct job links.
The 'keyRequiredSkills' should be derived from typical requirements for such a role if not explicitly available for a general link.
Output strictly in the defined JSON schema. Only include jobs if you can provide all mandatory fields and the match score is 50% or higher.
Include up to 10 jobs. If you cannot find any jobs that meet all criteria (including match score >= 50%), return an empty array for "jobs".
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
      const location = (currentJob.location && currentJob.location.trim() !== "") ? currentJob.location.trim() : "Unknown Location";
      
      const keyRequiredSkills = Array.isArray(currentJob.keyRequiredSkills) && currentJob.keyRequiredSkills.length > 0 
                                ? currentJob.keyRequiredSkills.map(s => String(s).trim()).filter(s => s) 
                                : ["Skill not specified"];
      
      const description = (currentJob.description && currentJob.description.trim() !== "") ? currentJob.description.trim() : "No description provided.";
      
      let applicationLink = (currentJob.applicationLink && currentJob.applicationLink.trim() !== "") ? currentJob.applicationLink.trim() : `https://www.google.com/search?q=${encodeURIComponent(title + " " + company + " " + location)}`;
      try {
        // Basic check if it looks like a URL, actual validation is harder without external libs or more complex regex
        if (!applicationLink.startsWith('http://') && !applicationLink.startsWith('https://')) {
            // Attempt to fix by prepending https:// if it's a common domain
            if (applicationLink.includes('.')) { // Simple check for a domain
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
      
      // Ensure match score is 50% or higher as per new requirement
      if (matchScore < 50) {
        console.warn(`JobRecommenderFlow: Skipping job "${title}" due to match score ${matchScore} < 50.`);
        continue;
      }

      processedJobs.push({
        title,
        company,
        location,
        keyRequiredSkills,
        description,
        applicationLink,
        matchScore,
      });
    }
    
    // Ensure between 0 and 10 jobs.
    const finalJobs = processedJobs.slice(0, 10); 

    return { jobs: finalJobs };
  }
);
