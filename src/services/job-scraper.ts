// src/services/job-scraper.ts

import type { RecommendedJob } from '@/ai/flows/job-recommender';
import { analyzeAndEnhanceJobs } from '@/utils/job-matching';

// Mock data for job listings since web scraping is not feasible in the browser environment
const mockJobData = {
  linkedin: [
    {
      title: "Software Engineer",
      company: "Infosys",
      location: "Bangalore, India",
      description: "Join Infosys as a Software Engineer to work on cutting-edge projects for global clients. Collaborate with talented professionals in a dynamic environment.",
      applicationLink: "https://www.linkedin.com/jobs/view/3544321789",
      matchScore: 85,
      keyRequiredSkills: ["JavaScript", "React", "Node.js", "TypeScript", "REST API"],
      platform: "LinkedIn"
    },
    {
      title: "Frontend Developer",
      company: "TCS",
      location: "Chennai, India",
      description: "TCS is looking for a Frontend Developer to build responsive web applications. Work with a team of designers and backend developers to create seamless user experiences.",
      applicationLink: "https://www.linkedin.com/jobs/view/3544321790",
      matchScore: 80,
      keyRequiredSkills: ["HTML", "CSS", "JavaScript", "React", "Redux"],
      platform: "LinkedIn"
    }
  ],
  naukri: [
    {
      title: "Full Stack Developer",
      company: "Wipro",
      location: "Hyderabad, India",
      description: "Wipro is seeking a Full Stack Developer to work on enterprise applications. Develop both frontend and backend components using modern technologies.",
      applicationLink: "https://www.naukri.com/job-listings-full-stack-developer-wipro-hyderabad",
      matchScore: 78,
      keyRequiredSkills: ["JavaScript", "Node.js", "MongoDB", "Express", "React"],
      platform: "Naukri"
    },
    {
      title: "Backend Engineer",
      company: "HCL Technologies",
      location: "Noida, India",
      description: "HCL is looking for a Backend Engineer to develop scalable and efficient server-side applications. Work with cross-functional teams to deliver high-quality software.",
      applicationLink: "https://www.naukri.com/job-listings-backend-engineer-hcl-technologies-noida",
      matchScore: 75,
      keyRequiredSkills: ["Java", "Spring Boot", "Microservices", "SQL", "REST API"],
      platform: "Naukri"
    }
  ],
  indeed: [
    {
      title: "DevOps Engineer",
      company: "Tech Mahindra",
      location: "Pune, India",
      description: "Tech Mahindra is hiring a DevOps Engineer to automate and optimize deployment workflows. Implement CI/CD pipelines and manage cloud infrastructure.",
      applicationLink: "https://in.indeed.com/viewjob?jk=12345678",
      matchScore: 72,
      keyRequiredSkills: ["Docker", "Kubernetes", "AWS", "Jenkins", "Terraform"],
      platform: "Indeed"
    },
    {
      title: "Data Scientist",
      company: "Cognizant",
      location: "Bangalore, India",
      description: "Cognizant is seeking a Data Scientist to analyze complex datasets and build predictive models. Work with stakeholders to derive actionable insights from data.",
      applicationLink: "https://in.indeed.com/viewjob?jk=87654321",
      matchScore: 70,
      keyRequiredSkills: ["Python", "Machine Learning", "SQL", "Data Analysis", "Statistics"],
      platform: "Indeed"
    }
  ],
  glassdoor: [
    {
      title: "Product Manager",
      company: "Amazon",
      location: "Hyderabad, India",
      description: "Amazon is looking for a Product Manager to lead the development of new features and products. Collaborate with engineering, design, and business teams to deliver customer-centric solutions.",
      applicationLink: "https://www.glassdoor.co.in/job-listing/product-manager-amazon-JV12345678",
      matchScore: 68,
      keyRequiredSkills: ["Product Management", "Agile", "User Stories", "Market Research", "Roadmapping"],
      platform: "Glassdoor"
    },
    {
      title: "UX Designer",
      company: "Microsoft",
      location: "Bangalore, India",
      description: "Microsoft is hiring a UX Designer to create intuitive and engaging user experiences. Conduct user research and design interfaces for web and mobile applications.",
      applicationLink: "https://www.glassdoor.co.in/job-listing/ux-designer-microsoft-JV87654321",
      matchScore: 65,
      keyRequiredSkills: ["UI Design", "User Research", "Wireframing", "Prototyping", "Figma"],
      platform: "Glassdoor"
    }
  ],
  simplyhired: [
    {
      title: "QA Engineer",
      company: "Accenture",
      location: "Chennai, India",
      description: "Accenture is seeking a QA Engineer to ensure software quality through manual and automated testing. Develop test plans and execute test cases for web applications.",
      applicationLink: "https://www.simplyhired.co.in/job/12345678",
      matchScore: 62,
      keyRequiredSkills: ["Selenium", "TestNG", "JIRA", "API Testing", "Test Automation"],
      platform: "SimplyHired"
    },
    {
      title: "Cloud Architect",
      company: "Deloitte",
      location: "Mumbai, India",
      description: "Deloitte is looking for a Cloud Architect to design and implement cloud solutions. Develop architecture patterns and best practices for cloud adoption.",
      applicationLink: "https://www.simplyhired.co.in/job/87654321",
      matchScore: 60,
      keyRequiredSkills: ["AWS", "Azure", "Cloud Migration", "Solution Architecture", "Security"],
      platform: "SimplyHired"
    }
  ]
};

/**
 * Job scraper service that provides job listings from various job portals
 * Note: This is a browser-compatible version that uses mock data instead of actual web scraping
 */
export class JobScraperService {
    /**
     * Get job listings from LinkedIn (mock data)
     * @param keywords Keywords to search for
     * @param location Location to search in
     * @returns Array of job listings
     */
    static async scrapeLinkedIn(keywords: string, location: string = 'India'): Promise<RecommendedJob[]> {
        console.log(`Getting LinkedIn jobs with keywords: ${keywords} in ${location}`);
        
        // Return mock data with some customization based on keywords
        return mockJobData.linkedin.map(job => ({
            ...job,
            // Add some of the keywords to the required skills to make it more relevant
            keyRequiredSkills: [...job.keyRequiredSkills, ...keywords.split(' ').slice(0, 2)]
                .filter((v, i, a) => a.indexOf(v) === i) // Remove duplicates
                .slice(0, 5) // Limit to 5 skills
        }));
    }

    /**
     * Get job listings from Naukri (mock data)
     * @param keywords Keywords to search for
     * @param location Location to search in
     * @returns Array of job listings
     */
    static async scrapeNaukri(keywords: string, location: string = 'India'): Promise<RecommendedJob[]> {
        console.log(`Getting Naukri jobs with keywords: ${keywords} in ${location}`);
        
        // Return mock data with some customization based on keywords
        return mockJobData.naukri.map(job => ({
            ...job,
            // Add some of the keywords to the required skills to make it more relevant
            keyRequiredSkills: [...job.keyRequiredSkills, ...keywords.split(' ').slice(0, 2)]
                .filter((v, i, a) => a.indexOf(v) === i) // Remove duplicates
                .slice(0, 5) // Limit to 5 skills
        }));
    }

    /**
     * Get job listings from Indeed (mock data)
     * @param keywords Keywords to search for
     * @param location Location to search in
     * @returns Array of job listings
     */
    static async scrapeIndeed(keywords: string, location: string = 'India'): Promise<RecommendedJob[]> {
        console.log(`Getting Indeed jobs with keywords: ${keywords} in ${location}`);
        
        // Return mock data with some customization based on keywords
        return mockJobData.indeed.map(job => ({
            ...job,
            // Add some of the keywords to the required skills to make it more relevant
            keyRequiredSkills: [...job.keyRequiredSkills, ...keywords.split(' ').slice(0, 2)]
                .filter((v, i, a) => a.indexOf(v) === i) // Remove duplicates
                .slice(0, 5) // Limit to 5 skills
        }));
    }

    /**
     * Get job listings from Glassdoor (mock data)
     * @param keywords Keywords to search for
     * @param location Location to search in
     * @returns Array of job listings
     */
    static async scrapeGlassdoor(keywords: string, location: string = 'India'): Promise<RecommendedJob[]> {
        console.log(`Getting Glassdoor jobs with keywords: ${keywords} in ${location}`);
        
        // Return mock data with some customization based on keywords
        return mockJobData.glassdoor.map(job => ({
            ...job,
            // Add some of the keywords to the required skills to make it more relevant
            keyRequiredSkills: [...job.keyRequiredSkills, ...keywords.split(' ').slice(0, 2)]
                .filter((v, i, a) => a.indexOf(v) === i) // Remove duplicates
                .slice(0, 5) // Limit to 5 skills
        }));
    }

    /**
     * Get job listings from SimplyHired (mock data)
     * @param keywords Keywords to search for
     * @param location Location to search in
     * @returns Array of job listings
     */
    static async scrapeSimplyHired(keywords: string, location: string = 'India'): Promise<RecommendedJob[]> {
        console.log(`Getting SimplyHired jobs with keywords: ${keywords} in ${location}`);
        
        // Return mock data with some customization based on keywords
        return mockJobData.simplyhired.map(job => ({
            ...job,
            // Add some of the keywords to the required skills to make it more relevant
            keyRequiredSkills: [...job.keyRequiredSkills, ...keywords.split(' ').slice(0, 2)]
                .filter((v, i, a) => a.indexOf(v) === i) // Remove duplicates
                .slice(0, 5) // Limit to 5 skills
        }));
    }

    /**
     * Get job listings from all supported platforms
     * @param keywords Keywords to search for
     * @param location Location to search in
     * @param candidateSkills Array of candidate skills for AI matching
     * @param candidateExperience Candidate experience summary for context
     * @returns Array of job listings from all platforms
     */
    static async scrapeAllPlatforms(
        keywords: string,
        location: string = 'India',
        candidateSkills: string[] = [],
        candidateExperience: string = ''
    ): Promise<RecommendedJob[]> {
        try {
            console.log(`Getting jobs with keywords: "${keywords}" in location: "${location}"`);
            console.log(`Candidate skills for matching: ${candidateSkills.join(', ')}`);

            // Run all mock data functions in parallel
            const [linkedInJobs, naukriJobs, indeedJobs, glassdoorJobs, simplyHiredJobs] = await Promise.all([
                this.scrapeLinkedIn(keywords, location),
                this.scrapeNaukri(keywords, location),
                this.scrapeIndeed(keywords, location),
                this.scrapeGlassdoor(keywords, location),
                this.scrapeSimplyHired(keywords, location)
            ]);

            // Combine all jobs
            const allJobs = [...linkedInJobs, ...naukriJobs, ...indeedJobs, ...glassdoorJobs, ...simplyHiredJobs];
            console.log(`Total jobs before AI analysis: ${allJobs.length}`);

            // If we have candidate skills, use AI to analyze and enhance the jobs
            let processedJobs = allJobs;
            if (candidateSkills.length > 0) {
                // Extract skills from keywords if no candidate skills provided
                const keywordSkills = keywords.split(/\s+/).filter(word => word.length > 3);
                const skillsToUse = candidateSkills.length > 0 ? candidateSkills : keywordSkills;

                // Use AI to analyze and enhance the jobs
                processedJobs = analyzeAndEnhanceJobs(allJobs, skillsToUse, candidateExperience);
                console.log(`Jobs after AI analysis and filtering: ${processedJobs.length}`);
            }

            // Sort by match score (highest first)
            processedJobs.sort((a, b) => b.matchScore - a.matchScore);

            // Return at most 10 jobs
            return processedJobs.slice(0, 10);
        } catch (error) {
            console.error('Error getting jobs from all platforms:', error);
            
            // In case of error, return a subset of mock data to ensure we always have some jobs
            const fallbackJobs = [
                ...mockJobData.linkedin.slice(0, 1),
                ...mockJobData.naukri.slice(0, 1),
                ...mockJobData.indeed.slice(0, 1),
                ...mockJobData.glassdoor.slice(0, 1)
            ];
            
            console.log(`Returning ${fallbackJobs.length} fallback jobs due to error`);
            return fallbackJobs;
        }
    }
}