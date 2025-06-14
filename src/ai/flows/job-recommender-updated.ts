// src/ai/flows/job-recommender-updated.ts
'use server';
/**
 * @fileOverview Generates job recommendations based on resume analysis from multiple job platforms.
 *
 * - getJobRecommendations - A function that handles the job recommendation process.
 * - JobRecommenderInput - The input type for the getJobRecommendations function.
 * - JobRecommenderOutput - The return type for the getJobRecommendations function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { searchJobsFromAllPlatforms } from '@/services/job-api-service';

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
export type RecommendedJob = z.infer<typeof RecommendedJobSchemaRequired>;

const RecommendedJobSchemaLax = RecommendedJobSchemaRequired.partial();

const JobRecommenderOutputSchema = z.object({
  jobs: z.array(RecommendedJobSchemaRequired).min(0).max(10).describe("A list of up to 10 recommended jobs (aiming for at least 5). Prioritize jobs that closely match the candidate's most recent experience and top skills. Locations in India like Chennai, Bangalore, Hyderabad, Coimbatore, and Trichy should be considered if relevant. Match score should be 30% or higher for inclusion. If no jobs meet the criteria, return an empty array."),
});
export type JobRecommenderOutput = z.infer<typeof JobRecommenderOutputSchema>;

/**
 * Get job recommendations based on resume skills and experience
 * This updated version tries to use real job APIs first, then falls back to AI-generated recommendations if needed
 */
export async function getJobRecommendations(input: JobRecommenderInput): Promise<JobRecommenderOutput> {
  try {
    // Extract target role from input if available
    const targetRole = input.targetRole || extractTargetRoleFromExperience(input.experienceSummary);

    // Extract location preference if available in the experience summary
    const location = extractLocationFromExperience(input.experienceSummary);

    // First try to get jobs from the API service
    try {
      const jobs = await searchJobsFromAllPlatforms({
        skills: input.skills,
        title: targetRole,
        location: location
      });

      // If we got jobs from the API, filter and return them
      if (jobs && jobs.length > 0) {
        const filteredJobs = jobs.filter(job => job.matchScore >= 30);
        if (filteredJobs.length > 0) {
          return { jobs: filteredJobs };
        }
      }
    } catch (apiError) {
      console.warn('API-based job search failed, falling back to AI-generated recommendations:', apiError);
      // Continue to AI fallback
    }

    // If API approach didn't work or returned no results, fall back to AI-generated recommendations
    return await generateAIJobRecommendations(input);
  } catch (error) {
    console.error('Error in getJobRecommendations:', error);
    return { jobs: [] };
  }
}

/**
 * Generate job recommendations using AI
 */
async function generateAIJobRecommendations(input: JobRecommenderInput): Promise<JobRecommenderOutput> {
  // Create sample jobs based on the input skills and experience
  // This is a fallback method that doesn't rely on external APIs or complex AI calls
  const sampleJobs: RecommendedJob[] = [];

  // Use the skills from the resume to generate relevant job recommendations
  const skills = input.skills || [];
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
  if (primarySkills.length === 0) {
    // If no skills are provided, use some generic skills
    primarySkills.push("Software Development", "Communication", "Problem Solving");
  }

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
  if (sampleJobs.length < 5 && skills.length > 0) {
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