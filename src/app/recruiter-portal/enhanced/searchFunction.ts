// Function to search LiveCareer resumes - using the API directly
const searchLiveCareerResumes = async (query: string): Promise<LiveCareerResumeSearchResult[]> => {
    // The API now handles errors and fallbacks internally
    return await searchLiveCareerApi(query, 20); // Limit to 20 results
};