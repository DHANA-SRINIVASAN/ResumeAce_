'use server';

import { getJobRecommendations as getJobRecommendationsImpl } from '@/ai/flows/job-recommender';
import type { JobRecommenderInput, JobRecommenderOutput } from '@/ai/flows/job-recommender';

export async function getJobRecommendations(input: JobRecommenderInput): Promise<JobRecommenderOutput> {
    return getJobRecommendationsImpl(input);
}