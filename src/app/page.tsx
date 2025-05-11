// src/app/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ResumeUploadForm } from '@/components/resume-upload-form';
import { AnalysisResultsDisplay } from '@/components/analysis-results-display';
import { ScoreFeedbackDisplay } from '@/components/score-feedback-display';
import { JobRecommendationsDisplay } from '@/components/job-recommendations-display';
import { InteractiveFeedback } from '@/components/interactive-feedback';
import { CareerRoadmapDisplay } from '@/components/career-roadmap-display';
import { BiasDetectionDisplay } from '@/components/bias-detection-display';
import { CourseRecommendationsDisplay } from '@/components/course-recommendations-display';
import { LoadingIndicator } from '@/components/loading-indicator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { analyzeResume, type AnalyzeResumeOutput } from '@/ai/flows/resume-analyzer';
import { analyzeResumeAndScore, type AnalyzeResumeAndScoreOutput } from '@/ai/flows/resume-score';
import { getJobRecommendations, type JobRecommenderOutput } from '@/ai/flows/job-recommender';
import { fileToDataUri } from '@/lib/file-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, FileText, Sparkles, Target, Bot, MapPinned, Filter, BookOpen } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


export default function HomePage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeResumeOutput | null>(null);
  const [scoreResult, setScoreResult] = useState<AnalyzeResumeAndScoreOutput | null>(null);
  const [jobRecommendations, setJobRecommendations] = useState<JobRecommenderOutput | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStage, setCurrentStage] = useState<string>("");
  const [activeTab, setActiveTab] = useState("analysis");
  
  const [derivedTargetRole, setDerivedTargetRole] = useState<string | undefined>(undefined);


  // Effect to clear results when file is removed
  useEffect(() => {
    if (!uploadedFile) {
      setAnalysisResult(null);
      setScoreResult(null);
      setJobRecommendations(null);
      setError(null);
      setActiveTab("analysis");
      setDerivedTargetRole(undefined);
    }
  }, [uploadedFile]);

  const handleAnalyzeResume = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setAnalysisResult(null);
    setScoreResult(null);
    setJobRecommendations(null);
    setUploadedFile(file);
    setActiveTab("analysis"); // Reset to analysis tab on new upload
    setDerivedTargetRole(undefined);


    const analysisSteps = [];

    try {
      setCurrentStage("Converting file...");
      const resumeDataUri = await fileToDataUri(file);
      analysisSteps.push({ stage: "File Conversion", status: "Completed" });

      setCurrentStage("Parsing resume with AI...");
      const analysis = await analyzeResume({ resumeDataUri });
      setAnalysisResult(analysis);
      analysisSteps.push({ stage: "AI Resume Parsing", status: "Completed" });


      setCurrentStage("Scoring resume...");
      // Construct a comprehensive text for scoring
      const resumeTextForScoring = `
        Name: ${analysis.name || 'N/A'}
        Contact: ${analysis.contactDetails || 'N/A'}
        Skills: ${analysis.skills?.join(', ') || 'N/A'}
        Education: ${analysis.education || 'N/A'}
        Experience: ${analysis.experience || 'N/A'}
        ${analysis.projects ? `Projects: ${analysis.projects.join('\n')}` : ''}
        Language: ${analysis.language || 'N/A'}
      `.trim();
      
      const scoreData = await analyzeResumeAndScore({ resumeText: resumeTextForScoring });
      setScoreResult(scoreData);
      analysisSteps.push({ stage: "Resume Scoring", status: "Completed" });


      if (scoreData.score >= 50) {
        setCurrentStage("Fetching job recommendations...");
        // Try to infer a target role from the most recent experience for better job recs
        let inferredTargetRole : string | undefined = undefined;
        if (analysis.experience) {
            const experienceLines = analysis.experience.split('\n');
            if (experienceLines.length > 0) {
                const firstExperienceLine = experienceLines[0];
                // Simple inference: take text before " at " or " | "
                const roleMatch = firstExperienceLine.match(/^([^@|]+)/);
                if (roleMatch && roleMatch[1]) {
                    inferredTargetRole = roleMatch[1].trim();
                    setDerivedTargetRole(inferredTargetRole);
                }
            }
        }

        const jobRecs = await getJobRecommendations({
          skills: analysis.skills || [],
          experienceSummary: analysis.experience || "",
          projectsSummary: analysis.projects,
          targetRole: inferredTargetRole,
        });
        setJobRecommendations(jobRecs);
        analysisSteps.push({ stage: "Job Recommendations", status: "Completed" });
      } else {
         analysisSteps.push({ stage: "Job Recommendations", status: "Skipped (Score < 50)" });
      }

    } catch (err) {
      console.error("Error during resume processing:", err);
      const failedStep = analysisSteps.find(step => step.stage === currentStage) || {stage: currentStage, status: "Failed"};
      setError(`Error during ${failedStep.stage}: ${err instanceof Error ? err.message : "An unknown error occurred."}`);
      analysisSteps.push({ stage: currentStage, status: `Failed - ${err instanceof Error ? err.message : "Unknown"}` });
    } finally {
      setIsProcessing(false);
      setCurrentStage("");
      // console.log("Analysis Steps:", analysisSteps); // For debugging
    }
  }, []);


  const renderContent = () => {
    if (isProcessing) {
      return (
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <LoadingIndicator text={currentStage || "Processing your resume..."} />
          </CardContent>
        </Card>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive" className="shadow-md">
          <AlertTitle className="font-semibold">Processing Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }
    
    if (!analysisResult) {
         return (
          <Card className="shadow-lg text-center bg-card">
            <CardHeader>
              <div className="mx-auto inline-block p-4 bg-primary/10 rounded-full text-primary mb-4">
                <BarChart className="w-12 h-12" />
              </div>
              <CardTitle className="text-2xl font-semibold text-primary">Ready for Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Upload your resume (PDF, DOCX, JPG, PNG) to get started. We'll parse its content, score its effectiveness,
                and provide actionable feedback & recommendations.
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
        );
    }

    // If analysis is complete, show tabs
    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 mb-6">
                <TabsTrigger value="analysis" className="flex items-center gap-2"><FileText size={18}/>Analysis</TabsTrigger>
                <TabsTrigger value="feedback" className="flex items-center gap-2"><Bot size={18}/>AI Chat</TabsTrigger>
                <TabsTrigger value="jobs" className="flex items-center gap-2" disabled={!jobRecommendations && scoreResult && scoreResult.score < 50}><Target size={18}/>Jobs</TabsTrigger>
                <TabsTrigger value="roadmap" className="flex items-center gap-2"><MapPinned size={18}/>Roadmap</TabsTrigger>
                <TabsTrigger value="bias" className="flex items-center gap-2"><Filter size={18}/>Bias Check</TabsTrigger>
                <TabsTrigger value="courses" className="flex items-center gap-2"><BookOpen size={18}/>Courses</TabsTrigger>
            </TabsList>

            <TabsContent value="analysis">
                <div className="space-y-8">
                    {scoreResult && <ScoreFeedbackDisplay scoreData={scoreResult} />}
                    {analysisResult && <AnalysisResultsDisplay analysis={analysisResult} />}
                </div>
            </TabsContent>
            <TabsContent value="feedback">
                <InteractiveFeedback analysisResult={analysisResult} scoreResult={scoreResult} />
            </TabsContent>
            <TabsContent value="jobs">
                 {jobRecommendations && <JobRecommendationsDisplay recommendations={jobRecommendations} />}
                 {!jobRecommendations && scoreResult && scoreResult.score < 50 && (
                    <Card className="shadow-md">
                        <CardHeader>
                            <CardTitle>Job Recommendations Locked</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Improve your resume score to 50 or above to unlock job recommendations.</p>
                        </CardContent>
                    </Card>
                 )}
            </TabsContent>
            <TabsContent value="roadmap">
                <CareerRoadmapDisplay analysisResult={analysisResult} />
            </TabsContent>
            <TabsContent value="bias">
                <BiasDetectionDisplay analysisResult={analysisResult} triggerAnalysis={activeTab === "bias"} />
            </TabsContent>
            <TabsContent value="courses">
                 <CourseRecommendationsDisplay analysisResult={analysisResult} targetRole={derivedTargetRole} triggerAnalysis={activeTab === "courses"} />
            </TabsContent>
        </Tabs>
    );
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
            Unlock your resume's potential. AI-powered analysis, scores, job recommendations, and a personalized career roadmap.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1 lg:sticky lg:top-8 space-y-8">
            <ResumeUploadForm onAnalyze={handleAnalyzeResume} isProcessing={isProcessing} />
             <Card className="bg-card shadow-md">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-primary flex items-center">
                        <FileText className="mr-2 h-5 w-5"/> How It Works
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                    <p>1. <span className="font-medium text-foreground">Upload</span> your resume (PDF, DOCX, JPG, PNG).</p>
                    <p>2. <span className="font-medium text-foreground">AI Analysis</span> extracts key info & scores it.</p>
                    <p>3. <span className="font-medium text-foreground">Explore Tabs</span> for detailed insights:</p>
                    <ul className="list-disc list-inside pl-4 space-y-1">
                        <li><span className="font-medium">Analysis:</span> Parsed data & score.</li>
                        <li><span className="font-medium">AI Chat:</span> Ask questions about your resume.</li>
                        <li><span className="font-medium">Jobs:</span> Recommendations (if score ≥ 50).</li>
                        <li><span className="font-medium">Roadmap:</span> Career plan to your target role.</li>
                        <li><span className="font-medium">Bias Check:</span> Inclusivity suggestions.</li>
                        <li><span className="font-medium">Courses:</span> Learning resources.</li>
                    </ul>
                </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-8">
            {renderContent()}
          </div>
        </div>
         <footer className="text-center mt-16 py-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} ResumeAce. Powered by Advanced AI.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
                All suggestions are AI-generated. Please verify critical information independently.
            </p>
        </footer>
      </div>
    </div>
  );
}
