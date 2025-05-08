// src/ai/flows/portfolio-generator-flow.ts
'use server';
/**
 * @fileOverview Generates a simple HTML portfolio page from resume data.
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
  contactDetails: z.string().describe("Contact details (e.g., email, LinkedIn profile URL if available, phone - be mindful of privacy for phone)."),
  skills: z.array(z.string()).describe("A list of skills."),
  education: z.string().describe("Education history (summary)."),
  experience: z.string().describe("Work experience (summary of key roles/achievements)."),
  projects: z.array(z.string()).optional().describe("A list of key projects with brief descriptions if available."),
});
export type PortfolioGeneratorInput = z.infer<typeof ResumeAnalysisSchemaForPortfolio>;


const PortfolioGeneratorOutputSchema = z.object({
  htmlContent: z.string().describe("The generated HTML content for the portfolio page. This should be a single HTML string including basic styling (inline CSS or a <style> block)."),
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
  prompt: `You are an AI assistant that generates a simple, clean, single-page HTML portfolio from structured resume data.
The portfolio should be professional and highlight the key aspects of the resume.
Include basic inline CSS or a <style> block for readability and presentation. Avoid external CSS files or complex JavaScript.

Resume Data:
Name: {{{name}}}
Contact Details: {{{contactDetails}}}
Skills: {{#if skills}}{{#each skills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}Not specified{{/if}}
Education: {{{education}}}
Experience: {{{experience}}}
Projects: {{#if projects}}{{#each projects}}"{{{this}}}"{{#unless @last}}, {{/unless}}{{/each}}{{else}}Not specified{{/if}}

Generate the HTML content. It should include sections for:
1.  Header: Name and a brief professional title (e.g., "Software Developer", "Data Analyst").
2.  Contact: Email, LinkedIn (if available in contactDetails). Be cautious about directly embedding phone numbers; maybe suggest adding it manually.
3.  About Me: A brief 1-2 sentence summary. You can try to synthesize this from the experience or ask for it. For now, use a placeholder if not easily derivable.
4.  Skills: A list or tag cloud of skills.
5.  Experience: A summary of key roles. Format for readability (e.g., Role at Company, Dates, brief description).
6.  Projects: A list of projects with descriptions.
7.  Education: Summary of education.
8.  Footer: Simple, e.g., "© {{name}} {{currentYear}}".

Make sure the HTML is well-formed. Use semantic HTML5 tags where appropriate.
For styling, use a professional and clean look. Consider a simple color scheme.
A suggested filename should be based on the person's name, like 'firstname_lastname_portfolio.html'.

Example structure for a project:
<div class="project">
  <h3>Project Title</h3>
  <p>Description of the project...</p>
</div>

Example structure for experience:
<div class="experience-item">
  <h4>Job Title at Company Name</h4>
  <p class="dates">Month Year - Month Year</p>
  <p>Brief description of responsibilities and achievements...</p>
</div>

Return ONLY the HTML content for 'htmlContent' and a 'suggestedFilename'.
The HTML should be a complete, runnable single HTML file content.
Include <!DOCTYPE html>, <html>, <head> (with a <title> and <style> tag), and <body>.
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
