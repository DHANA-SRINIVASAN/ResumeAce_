// src/ai/flows/feedback-pdf-generator-flow.ts
'use server';
/**
 * @fileOverview Generates HTML content for a candidate feedback report.
 * This HTML can then be used to generate a PDF (e.g., via browser print-to-PDF).
 *
 * - generateFeedbackHtml - A function that handles the HTML generation.
 * - FeedbackHtmlInput - The input type for the function.
 * - FeedbackHtmlOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { RecruiterMatchOutput } from './recruiter-matcher-flow';
import type { AnalyzeResumeOutput } from './resume-analyzer';

// Define schemas for the input, which will be a combination of RecruiterMatchOutput and AnalyzeResumeOutput
const RecruiterMatchOutputSchemaForFeedbackPdf = z.object({
  fitmentScore: z.number(),
  assessment: z.string(),
  reasoning: z.string(),
  keyMatches: z.array(z.string()),
  keyMismatches: z.array(z.string()),
  jdSkillsAnalysis: z.object({
    identifiedSkillsInJd: z.array(z.string()),
    mandatorySkillsMet: z.array(z.string()),
    optionalSkillsMet: z.array(z.string()),
    missingMandatorySkills: z.array(z.string()),
    missingOptionalSkills: z.array(z.string()).optional(),
    additionalSkillsInResume: z.array(z.string()),
  }).optional(),
  courseRecommendations: z.array(z.object({
    title: z.string(),
    platform: z.string(),
    description: z.string(),
    url: z.string().optional(),
    focusArea: z.string().optional(),
  })).optional(),
});

const AnalyzeResumeOutputSchemaForFeedbackPdf = z.object({
  name: z.string().optional(),
  contactDetails: z.string().optional(),
  skills: z.array(z.string()).optional(),
  education: z.string().optional(),
  experience: z.string().optional(),
  projects: z.array(z.string()).optional(),
  language: z.string().optional(),
});


const FeedbackHtmlInputSchema = z.object({
  matchData: RecruiterMatchOutputSchemaForFeedbackPdf.describe("The data from the recruiter match analysis."),
  resumeAnalysis: AnalyzeResumeOutputSchemaForFeedbackPdf.describe("The initial analysis data of the candidate's resume."),
  jobDescriptionTitle: z.string().optional().describe("The title of the job description for context, if available."),
});
export type FeedbackHtmlInput = z.infer<typeof FeedbackHtmlInputSchema>;

const FeedbackHtmlOutputSchema = z.object({
  htmlContent: z.string().describe("The generated HTML content for the feedback report. This should be a single HTML string including a comprehensive <style> block for a professional, printable design."),
  suggestedFilename: z.string().describe("A suggested filename for the HTML file (e.g., 'john_doe_feedback_report.html').")
});
export type FeedbackHtmlOutput = z.infer<typeof FeedbackHtmlOutputSchema>;

export async function generateFeedbackHtml(input: FeedbackHtmlInput): Promise<FeedbackHtmlOutput> {
  return feedbackHtmlFlow(input);
}

const feedbackHtmlPrompt = ai.definePrompt({
  name: 'feedbackHtmlPrompt',
  input: { schema: FeedbackHtmlInputSchema },
  output: { schema: FeedbackHtmlOutputSchema },
  prompt: `You are an AI assistant that generates a professional and printable HTML feedback report for a job candidate.
The report should be based on their resume analysis and a job description match.
The HTML must be well-formed and include a <style> block for all CSS.

Input Data:
Candidate Name: {{resumeAnalysis.name}}
Job Title (if provided): {{jobDescriptionTitle}}

Match Analysis:
Fitment Score: {{matchData.fitmentScore}}/100
Assessment: {{matchData.assessment}}
Reasoning: {{matchData.reasoning}}

Key Matches with JD:
{{#if matchData.keyMatches}}
{{#each matchData.keyMatches}}
- {{{this}}}
{{/each}}
{{else}}
None explicitly highlighted.
{{/if}}

Key Mismatches/Gaps for JD:
{{#if matchData.keyMismatches}}
{{#each matchData.keyMismatches}}
- {{{this}}}
{{/each}}
{{else}}
None explicitly highlighted.
{{/if}}

{{#if matchData.jdSkillsAnalysis}}
Detailed Skills Analysis:
  Identified skills in JD: {{#if matchData.jdSkillsAnalysis.identifiedSkillsInJd}} {{matchData.jdSkillsAnalysis.identifiedSkillsInJd.join ", "}} {{else}} N/A {{/if}}
  Mandatory skills met: {{#if matchData.jdSkillsAnalysis.mandatorySkillsMet}} {{matchData.jdSkillsAnalysis.mandatorySkillsMet.join ", "}} {{else}} N/A {{/if}}
  Optional skills met: {{#if matchData.jdSkillsAnalysis.optionalSkillsMet}} {{matchData.jdSkillsAnalysis.optionalSkillsMet.join ", "}} {{else}} N/A {{/if}}
  Missing mandatory skills: {{#if matchData.jdSkillsAnalysis.missingMandatorySkills}} {{matchData.jdSkillsAnalysis.missingMandatorySkills.join ", "}} {{else}} N/A {{/if}}
  {{#if matchData.jdSkillsAnalysis.missingOptionalSkills}}Missing optional skills: {{matchData.jdSkillsAnalysis.missingOptionalSkills.join ", "}} {{/if}}
  Additional skills in resume (not in JD): {{#if matchData.jdSkillsAnalysis.additionalSkillsInResume}} {{matchData.jdSkillsAnalysis.additionalSkillsInResume.join ", "}} {{else}} N/A {{/if}}
{{/if}}

{{#if matchData.courseRecommendations}}
Suggested Learning to Bridge Gaps:
{{#each matchData.courseRecommendations}}
  Course: {{{title}}}
  Platform: {{{platform}}}
  Relevance: {{{description}}}
  {{#if url}}Link: {{{url}}}{{/if}}
  {{#if focusArea}}Focus: {{{focusArea}}}{{/if}}

{{/each}}
{{/if}}

Design Guidelines for the HTML and CSS:
1.  **Overall Layout**: Clean, professional, suitable for printing. Single column is fine.
2.  **Color Palette**: Use a professional color scheme (e.g., primary: #3498db, text: #333, light gray accents: #ecf0f1, green for positive: #2ecc71, orange/red for areas of improvement: #e67e22 / #e74c3c).
3.  **Typography**: Clear, readable fonts (e.g., Arial, Helvetica). Good font sizes and line height.
4.  **Sections**:
    *   Header: Candidate Name, "Feedback Report for [Job Title if any]".
    *   Overall Score & Assessment: Prominently display score and qualitative assessment.
    *   Reasoning.
    *   Key Matches (use green indicators or styling).
    *   Key Mismatches/Gaps (use orange/red indicators or styling).
    *   Detailed Skills Analysis (if available).
    *   Course Recommendations (if any).
    *   Footer: "Generated by ResumeAce" and current date.
5.  **CSS**: All styles in a single <style> block in <head>. Use classes for styling.
    *   .report-container { max-width: 800px; margin: auto; padding: 20px; font-family: Arial, sans-serif; }
    *   .header { text-align: center; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 20px; }
    *   .score-section { text-align: center; margin-bottom: 20px; }
    *   .score { font-size: 48px; font-weight: bold; color: /*--primary-color*/; }
    *   .assessment { font-size: 20px; font-style: italic; color: /*--primary-color*/; }
    *   .section-title { font-size: 18px; font-weight: bold; margin-top: 20px; margin-bottom: 10px; color: /*--primary-color*/; border-bottom: 1px solid #eee; padding-bottom:5px;}
    *   .list { list-style-type: none; padding-left: 0; }
    *   .list li { margin-bottom: 5px; padding-left: 20px; position: relative; }
    *   .list li.match::before { content: '✔'; color: #2ecc71; position: absolute; left: 0; }
    *   .list li.mismatch::before { content: '✖'; color: #e74c3c; position: absolute; left: 0; }
    *   .course-item { border: 1px solid #ddd; padding: 10px; margin-bottom: 10px; border-radius: 5px; }
    *   .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 10px;}

Return ONLY the HTML content for 'htmlContent' and a 'suggestedFilename'.
Suggested filename like 'candidate_name_feedback_report_job_title.html'.
Current date: {{currentDate}} (This will be injected by the flow).
`,
});

const feedbackHtmlFlow = ai.defineFlow(
  {
    name: 'feedbackHtmlFlow',
    inputSchema: FeedbackHtmlInputSchema,
    outputSchema: FeedbackHtmlOutputSchema,
  },
  async (input) => {
    const enhancedInput = {
      ...input,
      currentDate: new Date().toLocaleDateString(),
    };
    const { output } = await feedbackHtmlPrompt(enhancedInput);
    return output!;
  }
);
