// src/ai/flows/career-roadmap-flow.ts
'use server';
/**
 * @fileOverview Generates a career roadmap in a graph format based on resume analysis and a target role.
 * The output is structured as nodes (skills, concepts, tools) and edges (dependencies),
 * suitable for rendering with graph libraries like react-flow.
 * It also integrates with roadmap.sh by instructing the LLM to consider its structure.
 *
 * - generateCareerRoadmap - A function that handles the career roadmap generation.
 * - CareerRoadmapInput - The input type for the function.
 * - CareerRoadmapOutput - The return type for the function.
 * - RoadmapNode - The type for a node in the career roadmap graph.
 * - RoadmapEdge - The type for an edge in the career roadmap graph.
 * - RoadmapResource - The type for a learning resource associated with a node.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Assuming AnalyzeResumeOutput structure from resume-analyzer.ts
const ResumeAnalysisSchemaForRoadmap = z.object({
  name: z.string().optional(),
  skills: z.array(z.string()).optional(),
  experience: z.string().optional(), // Summary of experience
  education: z.string().optional(),
  projects: z.array(z.string()).optional(),
  language: z.string().optional(),
});

const CareerRoadmapInputSchema = z.object({
  resumeAnalysis: ResumeAnalysisSchemaForRoadmap.describe("The analyzed data from the user's resume."),
  currentRole: z.string().optional().describe("The user's current role, if any, extracted from the resume or explicitly stated."),
  targetRole: z.string().describe("The user's desired target role (e.g., 'Frontend Developer', 'DevOps Engineer')."),
  useRoadmapSHStructure: z.boolean().optional().default(true).describe("Whether to base the roadmap structure on common patterns found on roadmap.sh for the given role."),
});
export type CareerRoadmapInput = z.infer<typeof CareerRoadmapInputSchema>;

const RoadmapResourceSchema = z.object({
  name: z.string().describe("The name of the learning resource (e.g., 'MDN Web Docs', 'Egghead.io course'). This field is mandatory for each resource."),
  url: z.string().url().optional().describe("An optional direct URL to the learning resource. If provided, it must be a valid and functional hyperlink. Example: 'https://developer.mozilla.org/en-US/docs/Web/HTML'"),
});
export type RoadmapResource = z.infer<typeof RoadmapResourceSchema>;

const RoadmapNodeSchema = z.object({
  id: z.string().describe("A unique, slug-like identifier for the node (e.g., 'html', 'javascript_basics', 'cicd_pipelines')."),
  label: z.string().describe("The display name of the skill, concept, or tool (e.g., 'HTML', 'JavaScript Basics', 'CI/CD Pipelines')."),
  stage: z.enum(["Fundamentals", "Core Skills", "Advanced Topics", "Optional/Nice-to-Have"]).describe("The learning stage this node belongs to."),
  description: z.string().optional().describe("A brief description of what this node/skill entails, why it's important for the target role, and key learning objectives. This should be concise but informative."),
  resources: z.array(RoadmapResourceSchema).default([]).describe("A list of 1-2 specific learning resource suggestions. Each resource object MUST contain a 'name' and can optionally include a 'url'."),
});
export type RoadmapNode = z.infer<typeof RoadmapNodeSchema>;

const RoadmapEdgeSchema = z.object({
  source: z.string().describe("The 'id' of the source/prerequisite node."),
  target: z.string().describe("The 'id' of the target/dependent node."),
  label: z.string().optional().describe("An optional short label for the edge describing the dependency (e.g., 'builds upon', 'requires understanding of')."),
});
export type RoadmapEdge = z.infer<typeof RoadmapEdgeSchema>;

const CareerRoadmapOutputSchema = z.object({
  introduction: z.string().describe("A brief introduction to the roadmap, acknowledging the user's aspiration for the target role."),
  nodes: z.array(RoadmapNodeSchema).describe("A list of 20-40 nodes representing skills, concepts, or tools, depending on role complexity. Each node must have an id, label, stage, and a resources array (possibly empty). Ensure nodes are ordered logically by stage."),
  edges: z.array(RoadmapEdgeSchema).describe("A list of directed edges showing learning dependencies between nodes. Each edge must have a source and target id."),
  potentialCertifications: z.array(z.string()).optional().describe("A list of 2-3 relevant certifications for the target role."),
  projectIdeas: z.array(z.string()).optional().describe("A list of 2-3 project ideas to build a portfolio relevant to the target role."),
  estimatedSalaryRange: z.string().optional().describe("An estimated general salary range for the target role (e.g., '$X - $Y per year')."),
  closingMotivation: z.string().describe("A brief motivational closing statement."),
});
export type CareerRoadmapOutput = z.infer<typeof CareerRoadmapOutputSchema>;


export async function generateCareerRoadmap(input: CareerRoadmapInput): Promise<CareerRoadmapOutput> {
  return careerRoadmapFlow(input);
}

const careerRoadmapPrompt = ai.definePrompt({
  name: 'careerRoadmapPrompt',
  input: { schema: CareerRoadmapInputSchema },
  output: { schema: CareerRoadmapOutputSchema },
  prompt: `You are an expert AI career coach and strategist. Your task is to generate a detailed career roadmap in a graph format for a user aspiring to the role of '{{{targetRole}}}', considering their current resume profile.
The graph should represent a logical learning path, progressing clearly through the stages: Fundamentals, Core Skills, Advanced Topics, and then Optional/Nice-to-Have.
{{#if useRoadmapSHStructure}}
Consider the typical structure and content found on roadmap.sh for the '{{{targetRole}}}' when designing the learning path, but ensure the output is personalized and adheres to the schema below.
{{/if}}

Resume Analysis Summary (for context):
Skills: {{#if resumeAnalysis.skills}}{{#each resumeAnalysis.skills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}Not specified{{/if}}
Experience Summary: {{resumeAnalysis.experience}}
{{#if currentRole}}Current Role (deduced or stated): {{{currentRole}}}{{/if}}

Generate the roadmap as a JSON object adhering strictly to the output schema. The roadmap should consist of:
1.  **Introduction**: A brief, encouraging intro for the user's journey towards '{{{targetRole}}}'.
2.  **Nodes**: An array of 20-40 nodes (depending on the complexity of '{{{targetRole}}}'). Each node represents a skill, concept, or tool. Nodes MUST be ordered logically by stage (Fundamentals first, then Core Skills, etc.).
    *   Each node MUST have:
        *   'id': A unique, simple, slug-like string (e.g., 'git_basics', 'api_design').
        *   'label': A human-readable name (e.g., 'Git Basics', 'API Design Principles').
        *   'stage': One of "Fundamentals", "Core Skills", "Advanced Topics", "Optional/Nice-to-Have".
        *   'description' (optional but highly recommended): A concise explanation of the item and its relevance.
        *   'resources': An array of 1-2 learning resource objects. Each object MUST have a 'name' (e.g., "Official React Documentation") and can optionally have a 'url' (e.g., "https://react.dev/learn"). If a 'url' is provided, it MUST be a functional hyperlink. This 'resources' array itself is mandatory (can be empty). Ensure resources are relevant and URLs are plausible.
3.  **Edges**: An array of directed edges showing learning dependencies (e.g., learn HTML before CSS).
    *   Each edge MUST have:
        *   'source': The 'id' of the prerequisite node.
        *   'target': The 'id' of the dependent node.
        *   'label' (optional): A short phrase for the dependency (e.g., 'foundational for').
4.  **Potential Certifications**: 2-3 relevant certifications.
5.  **Project Ideas**: 2-3 project ideas to build a portfolio.
6.  **Estimated Salary Range**: A general estimate for '{{{targetRole}}}'.
7.  **Closing Motivation**: A short, encouraging message.

Important:
-   Ensure all node 'id's used in 'edges' actually exist in the 'nodes' array.
-   Structure the 'nodes' and 'edges' to be suitable for rendering with a graph library like react-flow.
-   The number of nodes should be between 20 and 40. For very complex roles, lean towards the higher end. For simpler transitions, the lower end.
-   Node descriptions and resource suggestions should be practical and concise. Resource URLs must be valid if provided.
-   If referencing roadmap.sh structure, adapt it to fit this JSON format and personalize based on the resume.

Example Node:
{
  "id": "restful_apis",
  "label": "RESTful APIs",
  "stage": "Core Skills",
  "description": "Understand principles of REST, HTTP methods, and how to design and consume APIs. Essential for web communication.",
  "resources": [
    { "name": "Book: 'APIs: A Strategy Guide'", "url": "https://www.example.com/apis-guide" },
    { "name": "Tutorial: 'Build a REST API with Node.js on YouTube'", "url": "https://www.youtube.com/results?search_query=build+rest+api+node.js" }
  ]
}
Example Edge:
{
  "source": "javascript_basics",
  "target": "react_framework",
  "label": "prerequisite for"
}

Produce the ENTIRE output as a single JSON object strictly matching the defined schema. Ensure node order reflects a logical progression through stages.
`,
});

const careerRoadmapFlow = ai.defineFlow(
  {
    name: 'careerRoadmapFlow',
    inputSchema: CareerRoadmapInputSchema,
    outputSchema: CareerRoadmapOutputSchema,
  },
  async (input) => {
    const { output } = await careerRoadmapPrompt(input);
    
    // Basic validation and defaults, Zod handles most structure via schema defaults
    if (output) {
      output.nodes = output.nodes || [];
      output.edges = output.edges || [];
      output.potentialCertifications = output.potentialCertifications || [];
      output.projectIdeas = output.projectIdeas || [];

      // Ensure description exists, and resources are processed if needed (though Zod default helps)
      output.nodes = output.nodes.map(node => ({
        ...node,
        description: node.description || `Learn about ${node.label}.`,
        resources: (node.resources || []).map(resource => ({
            name: resource.name || "Unnamed Resource",
            ...resource // keep other fields like URL if they exist
        })),
      }));

      // Validate edges (simple check: source/target exist)
      const nodeIds = new Set(output.nodes.map(n => n.id));
      output.edges = output.edges.filter(edge => nodeIds.has(edge.source) && nodeIds.has(edge.target));

    }
    
    return output!;
  }
);
