// src/ai/flows/job-recommender-fixed.ts
'use server';
/**
 * @fileOverview Generates job recommendations based on resume analysis from multiple specified platforms.
 *
 * - getJobRecommendations - A function that handles the job recommendation process.
 * - JobRecommenderInput - The input type for the getJobRecommendations function.
 * - JobRecommenderOutput - The return type for the getJobRecommendations function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const JobRecommenderInputSchema = z.object({
    skills: z.array(z.string()).describe("A list of skills from the resume. This is the primary factor for matching."),
    experienceSummary: z.string().describe("A summary of the work experience from the resume, especially the most recent experience."),
    projectsSummary: z.array(z.string()).optional().describe("A list of project descriptions from the resume, which can highlight practical application of skills."),
    targetRole: z.string().optional().describe("A specific target role the user might be interested in. This is a secondary factor after skills."),
});
export type JobRecommenderInput = z.infer<typeof JobRecommenderInputSchema>;

const RecommendedJobSchemaRequired = z.object({
    title: z.string().describe("The job title. This field is absolutely mandatory."),
    company: z.string().describe("The hiring company name. This field is mandatory."),
    location: z.string().describe("The job location. Prioritize locations in India like Chennai, Bangalore, Hyderabad, Coimbatore, and Trichy if applicable, or as indicated by resume. This field is mandatory."),
    keyRequiredSkills: z.array(z.string()).describe("A list of 3-5 key skills required for the job, directly from the job posting if possible. This field is mandatory."),
    description: z.string().describe("A short job description (2-3 sentences) summarizing the role and its key responsibilities. This field is mandatory."),
    applicationLink: z.string().describe("A direct application link for the job. This field is mandatory."),
    matchScore: z.number().min(0).max(100).describe("A score from 0 to 100 indicating how well the job aligns with the candidate's skills and experience. This field is mandatory."),
    platform: z.string().describe("The platform where the job was found (e.g., LinkedIn, Naukri, Indeed, SimplyHired, Glassdoor). This field is mandatory."),
});
const RecommendedJobSchemaLax = RecommendedJobSchemaRequired.partial();

export type RecommendedJob = z.infer<typeof RecommendedJobSchemaRequired>;

const JobRecommenderOutputSchema = z.object({
    jobs: z.array(RecommendedJobSchemaRequired).min(0).max(10).describe("A list of up to 10 recommended jobs (aiming for at least 5). Prioritize jobs that closely match the candidate's most recent experience and top skills. Locations in India like Chennai, Bangalore, Hyderabad, Coimbatore, and Trichy should be considered if relevant. Match score should be 30% or higher for inclusion. If no jobs meet the criteria, return an empty array."),
});
export type JobRecommenderOutput = z.infer<typeof JobRecommenderOutputSchema>;


export async function getJobRecommendations(input: JobRecommenderInput): Promise<JobRecommenderOutput> {
    return jobRecommenderFlow(input);
}

const jobRecommenderPrompt = ai.definePrompt({
    name: 'jobRecommenderPrompt',
    input: { schema: JobRecommenderInputSchema },
    // Output schema for the prompt allows for partial data, post-processing will enforce stricter rules.
    output: { schema: z.object({ jobs: z.array(RecommendedJobSchemaLax).min(0) }) },
    prompt: `You are an expert job recommendation assistant and an adept job sourcer.
Your primary goal is to find relevant job openings based on the candidate's 'Skills'. This is the most important factor.
Also consider their recent experience and any target role mentioned.

Your task is to generate job recommendations. Aim for 5 to 10 diverse recommendations, but **it is crucial to provide any suitable matches you find, even if fewer than 5.** Returning some valid job entries is highly preferred over returning an empty list.

**For EVERY job recommendation you provide, you MUST attempt to include ALL of the following fields:**
- Job Title (e.g., "Software Engineer")
- Company Name (e.g., "Tech Solutions Inc.")
- Location (e.g., "Chennai, India", "Remote"). This field is mandatory.
- Key Required Skills (a list of 3-5 skills, e.g., ["Java", "Spring Boot", "SQL"])
- Short Job Description (2-3 sentences summarizing the role)
- Match Score (a percentage from 0 to 100, heavily reflecting skill alignment with the candidate's 'Skills')
- Direct Job Link (a plausible URL, e.g., https://www.linkedin.com/jobs/view/12345)
- Platform (The job portal name, e.g., "LinkedIn", "Naukri", "Indeed", "Glassdoor", "SimplyHired")

Simulate sourcing these jobs from a variety of platforms (LinkedIn, Naukri, Indeed, Glassdoor, SimplyHired). Aim for at least 3-4 distinct platform sources in your recommendations if suitable jobs are found.
Prioritize jobs located in India, specifically in cities like Chennai, Bangalore, Hyderabad, Coimbatore, and Trichy, if these align with the profile or are generally suitable.

Candidate's Resume Details:
Skills: {{#if skills}}{{#each skills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}No specific skills listed. Your ability to find jobs will be limited without skills.{{/if}}
Most Recent Experience Summary: {{{experienceSummary}}}
{{#if projectsSummary}}
Projects Summary (if relevant):
{{#each projectsSummary}}
- {{{this}}}
{{/each}}
{{/if}}
{{#if targetRole}}
User's Stated Target Role (consider this, but skill match is the primary driver): {{{targetRole}}}
{{/if}}

Output strictly in the defined JSON schema. 
Prioritize returning some job entries that are good skill matches, even if some details are harder to simulate (like a perfect application link). The system will attempt to clean up or default missing minor fields if necessary.
Ensure the 'Platform' field is accurately populated for each job you can find.
If you truly cannot find any relevant jobs based on the skills, you may return an empty 'jobs' array.
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
            const logMessage = !rawOutput?.jobs ? "LLM returned no/invalid jobs array or structure." : "LLM processing resulted in no jobs data.";

            console.warn(
                `JobRecommenderFlow: ${logMessage} LLM response details (if problematic):`,
                "No detailed error message available from LLM."
            );
            // Check for errors in the response
            if (!llmResponse.output) {
                console.error("JobRecommenderFlow: Underlying Genkit error - no output returned");
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

            if (matchScore < 30) { // Ensure this matches the prompt's threshold
                console.warn(`JobRecommenderFlow: Skipping job "${title}" due to match score ${matchScore} < 30.`);
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

        // Ensure the final list adheres to the max limit defined in JobRecommenderOutputSchema (max 10)
        const finalJobs = processedJobs.slice(0, 10);

        return { jobs: finalJobs };
    }
);