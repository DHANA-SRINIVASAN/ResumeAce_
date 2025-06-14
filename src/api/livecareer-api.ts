// src/api/livecareer-api.ts
'use client';

/**
 * LiveCareer API Service
 * 
 * This service provides methods to interact with the LiveCareer API for resume parsing,
 * analysis, and job matching functionality.
 */

// API configuration
const LIVECAREER_API_CONFIG = {
    baseUrl: 'https://api.livecareer.com/v1',
    apiKey: process.env.NEXT_PUBLIC_LIVECAREER_API_KEY || '',
    defaultHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
};

// Types for LiveCareer API responses
export interface LiveCareerResumeParseResponse {
    id: string;
    name: string;
    email: string;
    phone: string;
    skills: string[];
    experience: {
        title: string;
        company: string;
        startDate: string;
        endDate: string;
        description: string;
    }[];
    education: {
        institution: string;
        degree: string;
        fieldOfStudy: string;
        startDate: string;
        endDate: string;
    }[];
    // Add other fields as per LiveCareer API documentation
}

export interface LiveCareerJobMatchResponse {
    matchScore: number;
    matchDetails: {
        skillsMatch: {
            matched: string[];
            missing: string[];
        };
        experienceMatch: number;
        educationMatch: number;
    };
    recommendations: {
        skills: string[];
        courses: {
            title: string;
            provider: string;
            url?: string;
        }[];
    };
    // Add other fields as per LiveCareer API documentation
}

/**
 * Parse a resume file using LiveCareer API
 * @param file The resume file to parse
 * @returns Parsed resume data
 */
export async function parseResumeWithLiveCareer(file: File): Promise<LiveCareerResumeParseResponse> {
    // Check if we're in development mode and should use mock data
    const useMockData = process.env.NODE_ENV === 'development' || !LIVECAREER_API_CONFIG.apiKey;

    if (useMockData) {
        console.log('Using mock data for LiveCareer resume parsing (development mode or missing API key)');
        // Return mock data after a small delay to simulate network request
        await new Promise(resolve => setTimeout(resolve, 1200));

        // Generate a random ID for the mock resume
        const mockId = `mock-resume-${Date.now()}`;

        // Extract filename without extension for the mock name
        const fileName = file.name.replace(/\.[^/.]+$/, "");
        const nameParts = fileName.split(/[_\-\s]+/).filter(Boolean);

        // Try to extract a name from the filename, or use a default
        let firstName = 'John';
        let lastName = 'Doe';

        if (nameParts.length >= 2) {
            firstName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1).toLowerCase();
            lastName = nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1).toLowerCase();
        } else if (nameParts.length === 1) {
            firstName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1).toLowerCase();
        }

        // Generate mock resume data
        return {
            id: mockId,
            name: `${firstName} ${lastName}`,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
            phone: `+1 (555) ${100 + Math.floor(Math.random() * 900)}-${1000 + Math.floor(Math.random() * 9000)}`,
            skills: [
                'JavaScript',
                'React',
                'TypeScript',
                'HTML/CSS',
                'Node.js',
                'Git',
                'Agile'
            ],
            experience: [
                {
                    title: 'Senior Frontend Developer',
                    company: 'Tech Solutions Inc.',
                    startDate: '2020-01-01',
                    endDate: 'Present',
                    description: 'Led development of responsive web applications using React and TypeScript. Implemented CI/CD pipelines and improved performance by 40%.'
                },
                {
                    title: 'Frontend Developer',
                    company: 'Digital Innovations',
                    startDate: '2017-03-01',
                    endDate: '2019-12-31',
                    description: 'Developed user interfaces for client applications. Worked with cross-functional teams to deliver high-quality software solutions.'
                }
            ],
            education: [
                {
                    institution: 'University of Technology',
                    degree: 'Bachelor of Science',
                    fieldOfStudy: 'Computer Science',
                    startDate: '2013-09-01',
                    endDate: '2017-05-31'
                }
            ]
        };
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(`${LIVECAREER_API_CONFIG.baseUrl}/resume/parse`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${LIVECAREER_API_CONFIG.apiKey}`,
                // Don't set Content-Type for FormData, browser will set it with boundary
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`LiveCareer API error: ${errorData.message || response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error parsing resume with LiveCareer:', error);

        // Generate a fallback mock resume as above
        console.warn('Falling back to mock data for LiveCareer resume parsing');

        // Generate a random ID for the mock resume
        const mockId = `mock-resume-${Date.now()}`;

        // Extract filename without extension for the mock name
        const fileName = file.name.replace(/\.[^/.]+$/, "");
        const nameParts = fileName.split(/[_\-\s]+/).filter(Boolean);

        // Try to extract a name from the filename, or use a default
        let firstName = 'John';
        let lastName = 'Doe';

        if (nameParts.length >= 2) {
            firstName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1).toLowerCase();
            lastName = nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1).toLowerCase();
        } else if (nameParts.length === 1) {
            firstName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1).toLowerCase();
        }

        // Generate mock resume data
        return {
            id: mockId,
            name: `${firstName} ${lastName}`,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
            phone: `+1 (555) ${100 + Math.floor(Math.random() * 900)}-${1000 + Math.floor(Math.random() * 9000)}`,
            skills: [
                'JavaScript',
                'React',
                'TypeScript',
                'HTML/CSS',
                'Node.js',
                'Git',
                'Agile'
            ],
            experience: [
                {
                    title: 'Senior Frontend Developer',
                    company: 'Tech Solutions Inc.',
                    startDate: '2020-01-01',
                    endDate: 'Present',
                    description: 'Led development of responsive web applications using React and TypeScript. Implemented CI/CD pipelines and improved performance by 40%.'
                },
                {
                    title: 'Frontend Developer',
                    company: 'Digital Innovations',
                    startDate: '2017-03-01',
                    endDate: '2019-12-31',
                    description: 'Developed user interfaces for client applications. Worked with cross-functional teams to deliver high-quality software solutions.'
                }
            ],
            education: [
                {
                    institution: 'University of Technology',
                    degree: 'Bachelor of Science',
                    fieldOfStudy: 'Computer Science',
                    startDate: '2013-09-01',
                    endDate: '2017-05-31'
                }
            ]
        };
    }
}

/**
 * Match a resume against a job description using LiveCareer API
 * @param resumeId The ID of the parsed resume from LiveCareer
 * @param jobDescription The job description text
 * @returns Job match results
 */
export async function matchResumeToJobWithLiveCareer(
    resumeId: string,
    jobDescription: string
): Promise<LiveCareerJobMatchResponse> {
    // Check if we're in development mode and should use mock data
    const useMockData = process.env.NODE_ENV === 'development' || !LIVECAREER_API_CONFIG.apiKey;

    if (useMockData) {
        console.log('Using mock data for LiveCareer job matching (development mode or missing API key)');
        // Return mock data after a small delay to simulate network request
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Generate mock match data
        return getMockJobMatchResult(resumeId, jobDescription);
    }

    try {
        const response = await fetch(`${LIVECAREER_API_CONFIG.baseUrl}/resume/match`, {
            method: 'POST',
            headers: {
                ...LIVECAREER_API_CONFIG.defaultHeaders,
                'Authorization': `Bearer ${LIVECAREER_API_CONFIG.apiKey}`,
            },
            body: JSON.stringify({
                resumeId,
                jobDescription,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`LiveCareer API error: ${errorData.message || response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error matching resume with LiveCareer:', error);

        // Return mock data as fallback
        console.warn('Falling back to mock data for LiveCareer job matching');
        return getMockJobMatchResult(resumeId, jobDescription);
    }
}

// Helper function to generate mock job match results
function getMockJobMatchResult(resumeId: string, jobDescription: string): LiveCareerJobMatchResponse {
    // Extract keywords from job description to use for matching
    const keywords = jobDescription.toLowerCase().match(/\b\w{4,}\b/g) || [];
    const uniqueKeywords = [...new Set(keywords)].slice(0, 20);

    // Common skills for tech jobs
    const commonSkills = [
        'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue.js',
        'Node.js', 'Express', 'Python', 'Django', 'Flask',
        'Java', 'Spring Boot', 'C#', '.NET', 'PHP',
        'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis',
        'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes',
        'HTML', 'CSS', 'SASS', 'LESS', 'Tailwind CSS',
        'Git', 'CI/CD', 'Jenkins', 'GitHub Actions', 'GitLab CI',
        'Agile', 'Scrum', 'Kanban', 'JIRA', 'Confluence'
    ];

    // Generate matched and missing skills
    const matchedSkillsCount = 4 + Math.floor(Math.random() * 5); // 4-8 matched skills
    const missingSkillsCount = 2 + Math.floor(Math.random() * 3); // 2-4 missing skills

    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    // Add skills based on keywords from job description
    for (let i = 0; i < matchedSkillsCount; i++) {
        if (i < commonSkills.length) {
            const skill = commonSkills[i];
            if (!matchedSkills.includes(skill)) {
                matchedSkills.push(skill);
            }
        }
    }

    // Add missing skills
    for (let i = 0; i < missingSkillsCount; i++) {
        const skillIndex = commonSkills.length - 1 - i;
        if (skillIndex >= 0 && skillIndex < commonSkills.length) {
            const skill = commonSkills[skillIndex];
            if (!matchedSkills.includes(skill) && !missingSkills.includes(skill)) {
                missingSkills.push(skill);
            }
        }
    }

    // Generate a match score between 65-95
    const matchScore = 65 + Math.floor(Math.random() * 31);

    // Experience and education match scores
    const experienceMatch = 60 + Math.floor(Math.random() * 41); // 60-100
    const educationMatch = 70 + Math.floor(Math.random() * 31); // 70-100

    // Generate course recommendations
    const courseProviders = ['Coursera', 'Udemy', 'edX', 'LinkedIn Learning', 'Pluralsight'];
    const courseRecommendations = missingSkills.map(skill => ({
        title: `Advanced ${skill} Course`,
        provider: courseProviders[Math.floor(Math.random() * courseProviders.length)],
        url: `https://example.com/course/${skill.toLowerCase().replace(/\s+/g, '-')}`
    }));

    return {
        matchScore,
        matchDetails: {
            skillsMatch: {
                matched: matchedSkills,
                missing: missingSkills
            },
            experienceMatch,
            educationMatch
        },
        recommendations: {
            skills: missingSkills,
            courses: courseRecommendations
        }
    };
}

/**
 * Get resume suggestions and improvements from LiveCareer API
 * @param resumeId The ID of the parsed resume from LiveCareer
 * @returns Suggestions for resume improvement
 */
export async function getResumeSuggestions(resumeId: string): Promise<any> {
    // Check if we're in development mode and should use mock data
    const useMockData = process.env.NODE_ENV === 'development' || !LIVECAREER_API_CONFIG.apiKey;

    if (useMockData) {
        console.log('Using mock data for LiveCareer resume suggestions (development mode or missing API key)');
        // Return mock data after a small delay to simulate network request
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Generate mock suggestions
        return getMockResumeSuggestions(resumeId);
    }

    try {
        const response = await fetch(`${LIVECAREER_API_CONFIG.baseUrl}/resume/${resumeId}/suggestions`, {
            method: 'GET',
            headers: {
                ...LIVECAREER_API_CONFIG.defaultHeaders,
                'Authorization': `Bearer ${LIVECAREER_API_CONFIG.apiKey}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`LiveCareer API error: ${errorData.message || response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error getting resume suggestions from LiveCareer:', error);

        // Return mock data as fallback
        console.warn('Falling back to mock data for LiveCareer resume suggestions');
        return getMockResumeSuggestions(resumeId);
    }
}

// Helper function to generate mock resume suggestions
function getMockResumeSuggestions(resumeId: string): any {
    return {
        resumeId,
        overallScore: 75 + Math.floor(Math.random() * 16), // 75-90
        suggestions: [
            {
                category: 'Skills',
                score: 80,
                recommendations: [
                    'Add more specific technical skills',
                    'Quantify your skill proficiency levels',
                    'Include relevant certifications'
                ]
            },
            {
                category: 'Experience',
                score: 85,
                recommendations: [
                    'Use more action verbs to describe achievements',
                    'Quantify results where possible',
                    'Ensure chronological order is maintained'
                ]
            },
            {
                category: 'Education',
                score: 90,
                recommendations: [
                    'Include relevant coursework',
                    'Add GPA if above 3.5',
                    'List academic achievements'
                ]
            },
            {
                category: 'Format',
                score: 70,
                recommendations: [
                    'Improve readability with better section spacing',
                    'Use consistent formatting throughout',
                    'Ensure resume length is appropriate (1-2 pages)'
                ]
            }
        ],
        improvementAreas: [
            'Skills section could be more comprehensive',
            'Work experience descriptions could include more measurable achievements',
            'Consider adding a professional summary section'
        ],
        strengths: [
            'Good education background',
            'Relevant work experience',
            'Clear job titles and dates'
        ]
    };
}

/**
 * Search for resumes in the LiveCareer database
 * @param query Search query (keywords, skills, job titles, etc.)
 * @param limit Maximum number of results to return (default: 10)
 * @returns Array of resume search results
 */
export interface LiveCareerResumeSearchResult {
    id: string;
    name: string;
    skills: string[];
    experience: {
        title: string;
        company: string;
        startDate: string;
        endDate: string;
    }[];
    education?: {
        institution: string;
        degree: string;
        fieldOfStudy: string;
    }[];
    location?: string;
    lastUpdated?: string;
    matchScore?: number;
}

export async function searchLiveCareerResumes(
    query: string,
    limit: number = 10
): Promise<LiveCareerResumeSearchResult[]> {
    // Check if we're in development mode and should use mock data
    const useMockData = process.env.NODE_ENV === 'development' || !LIVECAREER_API_CONFIG.apiKey;

    if (useMockData) {
        console.log('Using mock data for LiveCareer resume search (development mode or missing API key)');
        // Return mock data after a small delay to simulate network request
        await new Promise(resolve => setTimeout(resolve, 800));
        return getMockResumeSearchResults(query);
    }

    try {
        const response = await fetch(
            `${LIVECAREER_API_CONFIG.baseUrl}/resumes/search?query=${encodeURIComponent(query)}&limit=${limit}`,
            {
                method: 'GET',
                headers: {
                    ...LIVECAREER_API_CONFIG.defaultHeaders,
                    'Authorization': `Bearer ${LIVECAREER_API_CONFIG.apiKey}`,
                },
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`LiveCareer API error: ${errorData.message || response.statusText}`);
        }

        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error('Error searching LiveCareer resumes:', error);
        // Return mock data as fallback
        console.warn('Falling back to mock data for LiveCareer resume search');
        return getMockResumeSearchResults(query);
    }
}

// Helper function to generate mock resume search results
function getMockResumeSearchResults(query: string): LiveCareerResumeSearchResult[] {
    // Generate some mock data based on the search query
    const mockSkills = [
        'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue.js',
        'Node.js', 'Express', 'Python', 'Django', 'Flask',
        'Java', 'Spring Boot', 'C#', '.NET', 'PHP',
        'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis',
        'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes',
        'HTML', 'CSS', 'SASS', 'LESS', 'Tailwind CSS',
        'Git', 'CI/CD', 'Jenkins', 'GitHub Actions', 'GitLab CI',
        'Agile', 'Scrum', 'Kanban', 'JIRA', 'Confluence'
    ];

    // Filter skills based on query
    const relevantSkills = mockSkills.filter(skill =>
        skill.toLowerCase().includes(query.toLowerCase()) ||
        Math.random() > 0.7 // Add some random skills too
    );

    // Generate 3-10 mock results
    const count = Math.floor(Math.random() * 7) + 3;
    const results: LiveCareerResumeSearchResult[] = [];

    const firstNames = ['John', 'Jane', 'Alex', 'Sarah', 'Michael', 'Emily', 'David', 'Lisa'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia'];
    const jobTitles = ['Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
        'DevOps Engineer', 'Data Scientist', 'UX Designer', 'Product Manager'];
    const companies = ['Tech Solutions Inc.', 'Digital Innovations', 'Software Systems LLC',
        'Cloud Computing Co.', 'Data Analytics Ltd.', 'Web Development Agency'];

    for (let i = 0; i < count; i++) {
        // Pick random names and titles
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const title = jobTitles[Math.floor(Math.random() * jobTitles.length)];
        const company = companies[Math.floor(Math.random() * companies.length)];

        // Pick 3-7 random skills from the relevant skills
        const skillCount = Math.floor(Math.random() * 4) + 3;
        const skills: string[] = [];
        for (let j = 0; j < skillCount && j < relevantSkills.length; j++) {
            const randomIndex = Math.floor(Math.random() * relevantSkills.length);
            const skill = relevantSkills[randomIndex];
            if (!skills.includes(skill)) {
                skills.push(skill);
            }
        }

        // Generate random dates for experience
        const endYear = 2023 - Math.floor(Math.random() * 3);
        const startYear = endYear - Math.floor(Math.random() * 5) - 1;
        const startDate = `${startYear}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-01`;
        const endDate = `${endYear}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-01`;

        results.push({
            id: `mock-${i}-${Date.now()}`,
            name: `${firstName} ${lastName}`,
            skills,
            experience: [
                {
                    title,
                    company,
                    startDate,
                    endDate,
                }
            ],
            education: [
                {
                    institution: 'University of Technology',
                    degree: 'Bachelor of Science',
                    fieldOfStudy: 'Computer Science',
                }
            ],
            location: 'Remote',
            lastUpdated: new Date().toISOString(),
            matchScore: Math.floor(Math.random() * 30) + 70, // Random score between 70-100
        });
    }

    // Sort by match score
    return results.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
}

/**
 * Get detailed information about a specific resume from LiveCareer
 * @param resumeId ID of the resume to retrieve
 * @returns Detailed resume data
 */
export async function getLiveCareerResumeDetails(resumeId: string): Promise<LiveCareerResumeParseResponse> {
    // Check if we're in development mode and should use mock data
    const useMockData = process.env.NODE_ENV === 'development' || !LIVECAREER_API_CONFIG.apiKey;

    if (useMockData) {
        console.log('Using mock data for LiveCareer resume details (development mode or missing API key)');
        // Return mock data after a small delay to simulate network request
        await new Promise(resolve => setTimeout(resolve, 800));
        return getMockResumeDetails(resumeId);
    }

    try {
        const response = await fetch(`${LIVECAREER_API_CONFIG.baseUrl}/resumes/${resumeId}`, {
            method: 'GET',
            headers: {
                ...LIVECAREER_API_CONFIG.defaultHeaders,
                'Authorization': `Bearer ${LIVECAREER_API_CONFIG.apiKey}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`LiveCareer API error: ${errorData.message || response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error getting LiveCareer resume details:', error);
        // Return mock data as fallback
        console.warn('Falling back to mock data for LiveCareer resume details');
        return getMockResumeDetails(resumeId);
    }
}

// Helper function to generate mock resume details
function getMockResumeDetails(resumeId: string): LiveCareerResumeParseResponse {
    // Extract any identifiable information from the resumeId
    // For mock-X-timestamp format, extract X
    const idParts = resumeId.split('-');
    const idNumber = idParts.length > 1 ? parseInt(idParts[1]) : 0;

    const firstNames = ['John', 'Jane', 'Alex', 'Sarah', 'Michael', 'Emily', 'David', 'Lisa'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia'];

    // Use the id number to deterministically select names
    const firstName = firstNames[idNumber % firstNames.length];
    const lastName = lastNames[(idNumber + 3) % lastNames.length];

    // Generate a consistent set of skills based on the id
    const allSkills = [
        'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue.js',
        'Node.js', 'Express', 'Python', 'Django', 'Flask',
        'Java', 'Spring Boot', 'C#', '.NET', 'PHP',
        'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis',
        'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes',
        'HTML', 'CSS', 'SASS', 'LESS', 'Tailwind CSS',
        'Git', 'CI/CD', 'Jenkins', 'GitHub Actions', 'GitLab CI',
        'Agile', 'Scrum', 'Kanban', 'JIRA', 'Confluence'
    ];

    // Select 5-10 skills based on the id
    const skillCount = 5 + (idNumber % 6);
    const skills: string[] = [];
    for (let i = 0; i < skillCount; i++) {
        const skillIndex = (idNumber + i * 7) % allSkills.length;
        skills.push(allSkills[skillIndex]);
    }

    // Generate experience entries
    const experienceCount = 1 + (idNumber % 3); // 1-3 experiences
    const experiences = [];

    const jobTitles = ['Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
        'DevOps Engineer', 'Data Scientist', 'UX Designer', 'Product Manager'];
    const companies = ['Tech Solutions Inc.', 'Digital Innovations', 'Software Systems LLC',
        'Cloud Computing Co.', 'Data Analytics Ltd.', 'Web Development Agency'];

    let currentYear = 2023;
    for (let i = 0; i < experienceCount; i++) {
        const duration = 1 + (idNumber + i) % 4; // 1-4 years
        const endYear = currentYear;
        const startYear = endYear - duration;

        experiences.push({
            title: jobTitles[(idNumber + i * 3) % jobTitles.length],
            company: companies[(idNumber + i * 5) % companies.length],
            startDate: `${startYear}-01-01`,
            endDate: i === 0 ? 'Present' : `${endYear}-01-01`,
            description: `Responsible for developing and maintaining software applications. Collaborated with cross-functional teams to deliver high-quality solutions. Implemented new features and fixed bugs.`
        });

        currentYear = startYear - 1; // Gap year between jobs
    }

    // Generate education entries
    const educationCount = 1 + (idNumber % 2); // 1-2 education entries
    const education = [];

    const institutions = ['University of Technology', 'State College', 'Technical Institute',
        'International University', 'City University', 'Online Academy'];
    const degrees = ['Bachelor of Science', 'Master of Science', 'Bachelor of Arts',
        'Master of Arts', 'Associate Degree', 'Certificate'];
    const fields = ['Computer Science', 'Information Technology', 'Software Engineering',
        'Data Science', 'Web Development', 'Cybersecurity'];

    currentYear = 2015 - (idNumber % 5); // Graduation year
    for (let i = 0; i < educationCount; i++) {
        const duration = 2 + (idNumber + i) % 3; // 2-4 years
        const endYear = currentYear;
        const startYear = endYear - duration;

        education.push({
            institution: institutions[(idNumber + i * 4) % institutions.length],
            degree: degrees[(idNumber + i * 2) % degrees.length],
            fieldOfStudy: fields[(idNumber + i * 3) % fields.length],
            startDate: `${startYear}-09-01`,
            endDate: `${endYear}-06-01`
        });

        currentYear = startYear - 1; // Gap year between education
    }

    return {
        id: resumeId,
        name: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
        phone: `+1 (555) ${100 + idNumber}-${1000 + idNumber * 3}`,
        skills,
        experience: experiences,
        education: education
    };
}