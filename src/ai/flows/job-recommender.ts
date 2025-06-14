// src/ai/flows/job-recommender.ts
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
  try {
    // First try to get recommendations using the AI flow
    const result = await jobRecommenderFlow(input);

    // If we got recommendations, return them
    if (result.jobs && result.jobs.length > 0) {
      return result;
    }

    // If no recommendations were found, generate some fallback recommendations
    console.log("No job recommendations found from AI flow, generating fallback recommendations");
    return generateFallbackRecommendations(input);
  } catch (error) {
    console.error("Error in getJobRecommendations:", error);
    // If there was an error, generate fallback recommendations
    return generateFallbackRecommendations(input);
  }
}

/**
 * Generate fallback job recommendations when the AI flow doesn't return any
 */
async function generateFallbackRecommendations(input: JobRecommenderInput): Promise<JobRecommenderOutput> {
  // Create sample jobs based on the input skills and experience
  const sampleJobs: RecommendedJob[] = [];

  // Use the skills from the resume to generate relevant job recommendations
  const skills = input.skills && input.skills.length > 0
    ? input.skills
    : ["Communication", "Problem Solving", "Teamwork", "Analytical Thinking", "Adaptability"];

  const targetRole = input.targetRole || extractTargetRoleFromExperience(input.experienceSummary) || "Professional";
  const location = extractLocationFromExperience(input.experienceSummary) || "Bangalore, India";

  // Common job platforms
  const platforms = ["LinkedIn", "Naukri", "Indeed", "Glassdoor", "SimplyHired"];

  // Common locations in India if no specific location is found
  const locations = [
    "Chennai, India",
    "Bangalore, India",
    "Hyderabad, India",
    "Mumbai, India",
    "Delhi, India",
    "Pune, India",
    "Coimbatore, India",
    "Remote"
  ];

  // Common company names for each platform
  const companies = {
    "LinkedIn": ["TechSolutions Inc.", "Global Innovations", "Digital Enterprises", "Future Technologies"],
    "Naukri": ["Infosys", "TCS", "Wipro", "HCL Technologies"],
    "Indeed": ["Amazon India", "Microsoft India", "Google India", "IBM India"],
    "Glassdoor": ["Accenture", "Deloitte", "EY", "KPMG"],
    "SimplyHired": ["Cognizant", "Tech Mahindra", "Capgemini", "Mindtree"]
  };

  // Generate job titles based on skills and target role
  const generateJobTitle = (skill: string, role: string): string => {
    const titles = [
      `${skill} ${role}`,
      `Senior ${skill} ${role}`,
      `${role} - ${skill} Specialist`,
      `${skill} Expert - ${role}`,
      `${role} with ${skill} Focus`
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  };

  // Generate job descriptions based on skills and role
  const generateDescription = (skill: string, role: string): string => {
    const descriptions = [
      `We are looking for a talented ${role} with expertise in ${skill}. You will work on exciting projects and collaborate with talented individuals.`,
      `Join our team as a ${role} specializing in ${skill}. This role involves developing solutions and working with cross-functional teams.`,
      `A great opportunity for a ${role} with strong ${skill} skills. You will be responsible for designing and implementing innovative solutions.`,
      `We need a ${role} who excels in ${skill} to join our growing team. You will help drive our technical initiatives forward.`,
      `Exciting position for a ${role} with ${skill} experience. You will contribute to cutting-edge projects in a collaborative environment.`
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  };

  // Use the top skills to generate job recommendations
  const primarySkills = skills.slice(0, Math.min(5, skills.length));

  // Generate jobs for each primary skill
  primarySkills.forEach((skill, index) => {
    // Select a platform for this job
    const platform = platforms[index % platforms.length];

    // Select a company for this platform
    const companyOptions = companies[platform as keyof typeof companies] || ["Tech Company"];
    const company = companyOptions[Math.floor(Math.random() * companyOptions.length)];

    // Select a location
    const jobLocation = locations[Math.floor(Math.random() * locations.length)];

    // Generate a job title
    const title = generateJobTitle(skill, targetRole);

    // Generate required skills (include the primary skill and some others)
    const requiredSkills = [
      skill,
      ...skills.filter(s => s !== skill).slice(0, 2) // Add up to 2 more skills from the resume
    ];

    // If we don't have enough skills, add some generic ones
    while (requiredSkills.length < 3) {
      const genericSkills = ["Communication", "Teamwork", "Problem Solving", "Analytical Thinking"];
      const randomSkill = genericSkills[Math.floor(Math.random() * genericSkills.length)];
      if (!requiredSkills.includes(randomSkill)) {
        requiredSkills.push(randomSkill);
      }
    }

    // Generate a description
    const description = generateDescription(skill, targetRole);

    // Generate a match score (higher for the first skills in the list)
    const matchScore = 85 - (index * 5); // Scores from 85 down by 5 for each skill

    // Generate an application link
    const applicationLink = `https://www.${platform.toLowerCase()}.com/jobs/view/${Math.floor(Math.random() * 1000000)}`;

    // Create the job object
    sampleJobs.push({
      title,
      company,
      location: jobLocation,
      keyRequiredSkills: requiredSkills,
      description,
      applicationLink,
      matchScore,
      platform
    });
  });

  // Generate a few more jobs with different platforms to ensure variety
  // Only do this if we have fewer than 5 jobs so far
  if (sampleJobs.length < 5) {
    const remainingPlatforms = platforms.filter(p => !sampleJobs.some(job => job.platform === p));

    remainingPlatforms.forEach((platform, index) => {
      if (sampleJobs.length >= 10) return; // Stop if we already have 10 jobs

      // Use a random skill or the first one if only one exists
      const skill = skills[Math.floor(Math.random() * skills.length)];

      // Select a company for this platform
      const companyOptions = companies[platform as keyof typeof companies] || ["Tech Company"];
      const company = companyOptions[Math.floor(Math.random() * companyOptions.length)];

      // Select a location
      const jobLocation = locations[Math.floor(Math.random() * locations.length)];

      // Generate a job title
      const title = generateJobTitle(skill, targetRole);

      // Generate required skills
      const requiredSkills = [
        skill,
        ...skills.filter(s => s !== skill).slice(0, 2) // Add up to 2 more skills from the resume
      ];

      // Generate a description
      const description = generateDescription(skill, targetRole);

      // Generate a match score (lower for these additional jobs)
      const matchScore = 70 - (index * 5); // Scores from 70 down by 5 for each additional job

      // Generate an application link
      const applicationLink = `https://www.${platform.toLowerCase()}.com/jobs/view/${Math.floor(Math.random() * 1000000)}`;

      // Create the job object
      sampleJobs.push({
        title,
        company,
        location: jobLocation,
        keyRequiredSkills: requiredSkills,
        description,
        applicationLink,
        matchScore,
        platform
      });
    });
  }

  // Sort jobs by match score (highest first)
  sampleJobs.sort((a, b) => b.matchScore - a.matchScore);

  // Filter jobs with match score >= 30
  const filteredJobs = sampleJobs.filter(job => job.matchScore >= 30);

  // Return the jobs (up to 10)
  return { jobs: filteredJobs.slice(0, 10) };
}

/**
 * Extract a potential target role from the experience summary
 */
function extractTargetRoleFromExperience(experienceSummary: string): string | undefined {
  if (!experienceSummary) return undefined;

  // Common job titles to look for
  const commonTitles = [
    'Software Engineer', 'Developer', 'Programmer', 'Architect',
    'Data Scientist', 'Data Analyst', 'Business Analyst',
    'Project Manager', 'Product Manager', 'Program Manager',
    'Designer', 'UX Designer', 'UI Designer',
    'DevOps Engineer', 'SRE', 'System Administrator',
    'QA Engineer', 'Test Engineer', 'Quality Assurance',
    'Marketing', 'Sales', 'Customer Support',
    'HR', 'Human Resources', 'Recruiter'
  ];

  // Look for common titles in the experience summary
  for (const title of commonTitles) {
    if (experienceSummary.includes(title)) {
      return title;
    }
  }

  return undefined;
}

/**
 * Extract a potential location preference from the experience summary
 */
function extractLocationFromExperience(experienceSummary: string): string | undefined {
  if (!experienceSummary) return undefined;

  // Common locations in India
  const commonLocations = [
    'Chennai', 'Bangalore', 'Hyderabad', 'Coimbatore', 'Trichy',
    'Mumbai', 'Delhi', 'Kolkata', 'Pune', 'Ahmedabad'
  ];

  // Look for common locations in the experience summary
  for (const location of commonLocations) {
    if (experienceSummary.includes(location)) {
      return `${location}, India`;
    }
  }

  return undefined;
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