// src/ai/flows/portfolio-generator-flow.ts
'use server';
/**
 * @fileOverview Generates a simple HTML portfolio page from resume data, with enhanced visuals using CSS.
 *
 * - generatePortfolioHtml - A function that handles the portfolio generation.
 * - PortfolioGeneratorInput - The input type for the function.
 * - PortfolioGeneratorOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Assuming AnalyzeResumeOutput structure from resume-analyzer.ts
const ResumeAnalysisSchemaForPortfolio = z.object({
  name: z.string().describe("The full name of the resume owner."),
  contactDetails: z.string().describe("Contact details (e.g., email, LinkedIn profile URL if available, phone - be mindful of privacy for phone). Extract email and LinkedIn if present."),
  skills: z.array(z.string()).describe("A list of skills."),
  education: z.string().describe("Education history (summary)."),
  experience: z.string().describe("Work experience (summary of key roles/achievements)."),
  projects: z.array(z.string()).optional().describe("A list of key projects with brief descriptions if available."),
});
export type PortfolioGeneratorInput = z.infer<typeof ResumeAnalysisSchemaForPortfolio>;


const PortfolioGeneratorOutputSchema = z.object({
  htmlContent: z.string().describe("The generated HTML content for the portfolio page. This should be a single HTML string including a comprehensive <style> block for a modern, responsive, and visually appealing design."),
  suggestedFilename: z.string().describe("A suggested filename for the HTML file (e.g., 'john_doe_portfolio.html').")
});
export type PortfolioGeneratorOutput = z.infer<typeof PortfolioGeneratorOutputSchema>;


export async function generatePortfolioHtml(input: PortfolioGeneratorInput): Promise<PortfolioGeneratorOutput> {
  return portfolioGeneratorFlow(input);
}

const portfolioGeneratorPrompt = ai.definePrompt({
  name: 'portfolioGeneratorPrompt',
  input: { schema: ResumeAnalysisSchemaForPortfolio },
  output: { schema: PortfolioGeneratorOutputSchema },
  prompt: `You are an AI assistant that generates a visually appealing, modern, and responsive single-page HTML portfolio from structured resume data.
The portfolio must be professional and highlight key aspects of the resume.
The HTML should be well-formed using semantic HTML5 tags.
Include a comprehensive <style> block within the <head> for all CSS. Do NOT use external CSS files or complex JavaScript.

Resume Data:
Name: {{{name}}}
Contact Details: {{{contactDetails}}} (Extract email and LinkedIn URL if present in this string. For LinkedIn, use the text 'LinkedIn Profile'. For email, use 'Email Me'.)
Skills: {{#if skills}}{{#each skills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}Not specified{{/if}}
Education: {{{education}}}
Experience: {{{experience}}}
Projects: {{#if projects}}{{#each projects}}"{{{this}}}"{{#unless @last}}, {{/unless}}{{/each}}{{else}}Not specified{{/if}}

Design Guidelines for the HTML and CSS:
1.  **Overall Layout & Appearance**:
    *   Create a clean, professional, and modern aesthetic.
    *   Use a harmonious color palette. For example: a dark text color (e.g., #333), a primary accent color (e.g., a professional blue like #007bff or a teal like #17a2b8), a light background (e.g., #f8f9fa or white), and a slightly darker shade for card backgrounds (e.g., #ffffff or #e9ecef).
    *   Structure the page with a clear visual hierarchy. Use CSS Flexbox or Grid for main layout sections (e.g., a main content area and a potential sidebar, or a single-column layout with distinct sections).
    *   Ensure good readability with appropriate font choices (use common sans-serif fonts like Arial, Helvetica, or system fonts), font sizes, line-height (e.g., 1.6), and spacing.
    *   Apply rounded corners (e.g., border-radius: 8px;) to elements like cards, buttons, and image placeholders.
    *   Use subtle box-shadows (e.g., box-shadow: 0 4px 8px rgba(0,0,0,0.1);) on cards or section containers to create depth.
    *   The page must be responsive. Use media queries to ensure it looks good on desktop, tablet, and mobile screens. (e.g., sections stack vertically on smaller screens).

2.  **Sections (Order: Header, About, Skills, Experience, Projects, Education, Contact, Footer)**:
    *   **Header/Hero**:
        *   Display the Name prominently (e.g., <h1>).
        *   Include a professional title (e.g., "Software Developer" or "Aspiring Data Analyst") below the name (e.g., <p class="tagline">).
        *   Include a circular placeholder for a profile picture (e.g., a 150x150px div with a border and a background color, styled with border-radius: 50%;).
    *   **About Me (Optional but Recommended)**:
        *   If possible, synthesize a brief 1-2 sentence summary from the experience. If not, use a placeholder like "A passionate and dedicated professional..."
    *   **Skills**:
        *   Display skills as styled badges (e.g., inline-block elements with padding, background color from the accent palette, rounded corners, and margin).
    *   **Experience**:
        *   List each experience item clearly. Use a card-like structure for each item (div with class 'experience-item').
        *   Inside each card: Role (<h4>), Company & Dates (<h5>), and a paragraph for description/achievements.
    *   **Projects**:
        *   Similar to experience, present projects in visually distinct cards (div with class 'project-item').
        *   Inside each card: Project Name (<h4>), and a paragraph for description.
    *   **Education**:
        *   Clear and concise presentation, perhaps also in a card or a well-formatted section.
    *   **Contact**:
        *   List contact details. If LinkedIn URL and email are extracted from 'contactDetails':
            *   For Email: <a href="mailto:extracted_email">Email Me</a>
            *   For LinkedIn: <a href="extracted_linkedin_url" target="_blank">LinkedIn Profile</a>
            *   Style these links to be visually clear, perhaps like buttons or distinct text links.
    *   **Footer**:
        *   Simple footer: "© {{{name}}} {{currentYear}}". Center align it.

3.  **CSS Specifics in <style> tag**:
    *   Define styles for body, h1, h2, h3, h4, p, a.
    *   Create classes for .container (to center content and set max-width), .card (for experience, projects), .badge (for skills), .profile-pic-placeholder, .tagline, .section, .section-title.
    *   Example for a card: .card { background-color: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
    *   Example for skill badge: .badge { display: inline-block; background-color: #007bff; color: white; padding: 5px 10px; margin: 5px; border-radius: 4px; font-size: 0.9em; }
    *   Example for responsive behavior: @media (max-width: 768px) { /* styles for mobile */ .container { padding: 15px; } /* etc. */ }

Return ONLY the HTML content for 'htmlContent' (which is a single string for a complete HTML file including <!DOCTYPE html>, <html>, <head> with <title> and the <style> block, and <body>) and a 'suggestedFilename'.
A suggested filename should be based on the person's name, like 'firstname_lastname_portfolio.html'.
Make the portfolio visually rich and modern.
Be careful to correctly parse and use the handlebars variables for name, contactDetails, skills, education, experience, projects, and currentYear.
If 'contactDetails' string contains a LinkedIn URL, use it. If it contains an email, use it. Otherwise, provide generic placeholders or omit.
Example for profile picture placeholder: <div class="profile-pic-placeholder"></div> with CSS for size, border, background.
Example for section title: <h2 class="section-title">Experience</h2>.
`,
});

const portfolioGeneratorFlow = ai.defineFlow(
  {
    name: 'portfolioGeneratorFlow',
    inputSchema: ResumeAnalysisSchemaForPortfolio,
    outputSchema: PortfolioGeneratorOutputSchema,
  },
  async (input) => {
    // Add currentYear to the input for the prompt, as Handlebars can't call new Date()
    const enhancedInput = {
      ...input,
      currentYear: new Date().getFullYear()
    };
    const { output } = await portfolioGeneratorPrompt(enhancedInput);
    return output!;
  }
);

