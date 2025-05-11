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

Your first task is to meticulously analyze the 'Resume Details' (Skills, Experience Summary, Projects Summary).
From this analysis, identify the 3-5 most dominant and recurring skills, technologies, or experience themes. These themes will be the foundation for your job recommendations.

For each identified theme, formulate a job recommendation. The 'title' of each job *must directly derive* from these themes and the specific language used in the resume. For example, if the resume heavily features "React development, UI/UX design, and agile methodologies," a relevant job title could be "React Frontend Developer" or "UI Developer with React." Avoid generic titles like "Software Engineer" unless the resume's breadth and depth overwhelmingly support such a general role. If the resume is highly specialized (e.g., "Quantitative Analyst with Python and C++ for HFT"), the job title should reflect this specialization.

{{#if targetRole}}
The user has expressed an interest in the role: '{{{targetRole}}}'. If this target role aligns well with the dominant themes you identified from the resume, prioritize recommendations related to it. However, if '{{{targetRole}}}' significantly diverges from the resume's content, you must still base your primary recommendations on the resume's actual skills and experience. The core job recommendations must be grounded in the resume.
{{/if}}

For each and every job role, you MUST provide:
1.  **Title**: (As described above) This field is absolutely critical and mandatory. If you cannot confidently generate a valid, non-empty, and *relevant* title based on the resume's themes, omit that entire job entry.
2.  **Company**: A plausible company name (e.g., "Tech Solutions Inc.", "Innovatech", or a well-known company if appropriate). This is mandatory.
3.  **Description**: This description (1-3 sentences) MUST explicitly reference specific skills, phrases from the 'Experience Summary', or details from 'Projects Summary' from the provided resume to justify why this job is a strong match. For example: "This 'React Frontend Developer' role at 'Innovatech' is an excellent fit given your demonstrated expertise in 'React development' and 'UI/UX design principles' mentioned in your skills, and your project experience in 'building responsive web applications with React' as detailed in your Projects Summary." Generic descriptions are unacceptable. This field is mandatory.
4.  **Relevance Score**: A number between 0.0 and 1.0 indicating how relevant *this specific job title and description* are to the *provided resume details*. A score of 1.0 means a perfect match for the resume's core strengths. This field is mandatory.
5.  **Suggested Search Links**: An object containing optional string URLs for LinkedIn, Naukri, Indeed, and Glassdoor. These URLs should be functional search queries based on the *specific job title and potentially key skills*. For example, for LinkedIn: 'https://www.linkedin.com/jobs/search/?keywords=Python%20Django%20Developer&location=REMOTE'. This 'suggestedSearchLinks' object is mandatory, even if individual links are not always generatable (provide valid default search query URLs for each platform based on the job title if specific ones cannot be formed).

Resume Details:
Skills: {{#if skills}}{{#each skills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}No specific skills listed.{{/if}}
Experience Summary: {{{experienceSummary}}}
{{#if projectsSummary}}
Projects Summary:
{{#each projectsSummary}}
- {{{this}}}
{{/each}}
{{/if}}

Generate 3-5 recommendations. Prioritize direct relevance to the resume's content.
Ensure ALL required fields ('title', 'company', 'description', 'relevanceScore', and 'suggestedSearchLinks') are present for *every* job object in the 'jobs' array.
The output must strictly adhere to the JSON schema. The 'title' and 'description' relevance is paramount.
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

