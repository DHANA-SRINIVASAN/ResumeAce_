import { config } from 'dotenv';
config();

import '@/ai/flows/resume-score.ts';
import '@/ai/flows/resume-analyzer.ts';
import '@/ai/flows/job-recommender.ts';
import '@/ai/flows/interactive-feedback-flow.ts';
import '@/ai/flows/career-roadmap-flow.ts';
import '@/ai/flows/bias-detection-flow.ts';
import '@/ai/flows/portfolio-generator-flow.ts';
import '@/ai/flows/course-recommender-flow.ts';
import '@/ai/flows/recruiter-matcher-flow.ts';
import '@/ai/flows/resume-summary-flow.ts'; // Added new flow
import '@/ai/flows/feedback-pdf-generator-flow.ts'; // Added new flow
