"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ResumeUploadForm } from '@/components/resume-upload-form';
import { AnalysisResultsDisplay } from '@/components/analysis-results-display';
import { ScoreFeedbackDisplay } from '@/components/score-feedback-display';
import { JobRecommendationsDisplay } from '@/components/job-recommendations-display';
import { LoadingIndicator } from '@/components/loading-indicator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { analyzeResume, type AnalyzeResumeOutput } from '@/ai/flows/resume-analyzer';
import { analyzeResumeAndScore, type AnalyzeResumeAndScoreOutput } from '@/ai/flows/resume-score';
import { getJobRecommendations, type JobRecommenderOutput } from '@/ai/flows/job-recommender';
import { fileToDataUri } from '@/lib/file-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, FileText, Sparkles, Target } from 'lucide-react';

export default function HomePage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeResumeOutput | null>(null);
  const [scoreResult, setScoreResult] = useState<AnalyzeResumeAndScoreOutput | null>(null);
  const [jobRecommendations, setJobRecommendations] = useState<JobRecommenderOutput | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStage, setCurrentStage] = useState<string>(""); // For detailed loading message

  // Effect to clear results when file is removed
  useEffect(() => {
    if (!uploadedFile) {
      setAnalysisResult(null);
      setScoreResult(null);
      setJobRecommendations(null);
      setError(null);
    }
  }, [uploadedFile]);

  const handleAnalyzeResume = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setAnalysisResult(null);
    setScoreResult(null);
    setJobRecommendations(null);
    setUploadedFile(file);

    try {
      setCurrentStage("Converting file...");
      const resumeDataUri = await fileToDataUri(file);

      setCurrentStage("Parsing resume with AI...");
      const analysis = await analyzeResume({ resumeDataUri });
      setAnalysisResult(analysis);

      setCurrentStage("Scoring resume...");
      const resumeTextForScoring = `
        Name: ${analysis.name}
        Contact: ${analysis.contactDetails}
        Skills: ${analysis.skills.join(', ')}
        Education: ${analysis.education}
        Experience: ${analysis.experience}
        ${analysis.projects ? `Projects: ${analysis.projects.join('\n')}` : ''}
      `.trim();

      const scoreData = await analyzeResumeAndScore({ resumeText: resumeTextForScoring });
      setScoreResult(scoreData);

      if (scoreData.score >= 50) {
        setCurrentStage("Fetching job recommendations...");
        const jobRecs = await getJobRecommendations({
          skills: analysis.skills,
          experienceSummary: analysis.experience,
          // Optionally, you could try to infer a target role or add a field for it
        });
        setJobRecommendations(jobRecs);
      }

    } catch (err) {
      console.error("Error during resume processing:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
      // Ensure specific error messages for different stages if possible
      if (currentStage.includes("Parsing") || currentStage.includes("Scoring")) {
        setError(`An error occurred during AI analysis: ${err instanceof Error ? err.message : "Unknown AI error."}`);
      } else if (currentStage.includes("job recommendations")) {
         setError(`An error occurred while fetching job recommendations: ${err instanceof Error ? err.message : "Unknown error."}`);
      }
    } finally {
      setIsProcessing(false);
      setCurrentStage("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 py-8">
      <div className="container mx-auto px-4">
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center bg-primary text-primary-foreground p-3 rounded-lg shadow-lg mb-4">
            <Sparkles className="w-10 h-10" />
          </div>
          <h1 className="text-5xl font-extrabold text-primary tracking-tight">
            Resume<span className="text-accent">Ace</span>
          </h1>
          <p className="mt-3 text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlock your resume's potential. Get AI-powered analysis, scores, job recommendations, and insights in seconds.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1 lg:sticky lg:top-8">
            <ResumeUploadForm onAnalyze={handleAnalyzeResume} isProcessing={isProcessing} />
             <Card className="mt-8 bg-card shadow-md">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-primary flex items-center">
                        <FileText className="mr-2 h-5 w-5"/> How It Works
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                    <p>1. <span className="font-medium text-foreground">Upload</span> your resume (PDF or DOCX).</p>
                    <p>2. <span className="font-medium text-foreground">AI Analysis</span> extracts key information.</p>
                    <p>3. <span className="font-medium text-foreground">Scoring</span> evaluates its effectiveness.</p>
                    <p>4. <span className="font-medium text-foreground">Recommendations</span> get job suggestions (if score ≥ 50).</p>
                    <p>5. <span className="font-medium text-foreground">View</span> insights and feedback instantly.</p>
                </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-8">
            {isProcessing && (
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <LoadingIndicator text={currentStage || "Processing your resume..."} />
                </CardContent>
              </Card>
            )}

            {error && !isProcessing && (
              <Alert variant="destructive" className="shadow-md">
                <AlertTitle className="font-semibold">Processing Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!isProcessing && !analysisResult && !error && (
              <Card className="shadow-lg text-center bg-card">
                <CardHeader>
                  <div className="mx-auto inline-block p-4 bg-primary/10 rounded-full text-primary mb-4">
                    <BarChart className="w-12 h-12" />
                  </div>
                  <CardTitle className="text-2xl font-semibold text-primary">Ready for Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Upload your resume to get started. We'll parse its content, score its effectiveness,
                    and provide actionable feedback. If your score is 50 or above, we'll also suggest relevant jobs!
                  </p>
                  <Image 
                    src="https://picsum.photos/600/300" 
                    alt="Resume analysis placeholder" 
                    width={600} 
                    height={300}
                    className="mt-6 rounded-lg shadow-md mx-auto"
                    data-ai-hint="resume document"
                  />
                </CardContent>
              </Card>
            )}
            
            <div className="space-y-8">
              {scoreResult && !isProcessing && !error && (
                <ScoreFeedbackDisplay scoreData={scoreResult} />
              )}
              {analysisResult && !isProcessing && !error && (
                <AnalysisResultsDisplay analysis={analysisResult} />
              )}
              {jobRecommendations && !isProcessing && !error && (
                <JobRecommendationsDisplay recommendations={jobRecommendations} />
              )}
            </div>

          </div>
        </div>
         <footer className="text-center mt-16 py-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} ResumeAce. Powered by AI.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
                Job recommendations are AI-generated suggestions and require verification on job platforms.
            </p>
        </footer>
      </div>
    </div>
  );
}
