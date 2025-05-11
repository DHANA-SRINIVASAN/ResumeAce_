// src/app/candidate-portal/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { AuthGuard } from '@/components/auth-guard'; 
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
import { BarChart, FileText, Sparkles, Target, Bot, MapPinned, Filter, BookOpen, Lightbulb, ShieldAlert, Info } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function CandidatePortalContent() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeResumeOutput | null>(null);
  const [scoreResult, setScoreResult] = useState<AnalyzeResumeAndScoreOutput | null>(null);
  const [jobRecommendations, setJobRecommendations] = useState<JobRecommenderOutput | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStage, setCurrentStage] = useState<string>("");
  const [activeTab, setActiveTab] = useState("analysis");
  const [derivedTargetRole, setDerivedTargetRole] = useState<string | undefined>(undefined);

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
    setActiveTab("analysis");
    setDerivedTargetRole(undefined);

    try {
      setCurrentStage("Converting file...");
      const resumeDataUri = await fileToDataUri(file);

      setCurrentStage("Parsing resume with AI...");
      const analysis = await analyzeResume({ resumeDataUri });
      setAnalysisResult(analysis);

      setCurrentStage("Scoring resume...");
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

      if (scoreData.score >= 30) { 
        setCurrentStage("Fetching job recommendations...");
        
        let inferredTargetRole : string | undefined = undefined;
        if (analysis.experience) {
            const experienceLines = analysis.experience.split('\n');
            if (experienceLines.length > 0) {
                const firstExperienceLine = experienceLines[0];
                const roleMatch = firstExperienceLine.match(/^([^@|]+)/);
                if (roleMatch && roleMatch[1]) {
                    inferredTargetRole = roleMatch[1].trim();
                    setDerivedTargetRole(inferredTargetRole);
                }
            }
        }
        
        const inputForJobRecs = {
          skills: analysis.skills || [],
          experienceSummary: analysis.experience || "",
          projectsSummary: analysis.projects,
          targetRole: inferredTargetRole,
        };

        const jobRecs = await getJobRecommendations(inputForJobRecs);
        setJobRecommendations(jobRecs);
      } else {
         setJobRecommendations({jobs: []});
      }

    } catch (err) {
      console.error("Error during resume processing:", err);
      setError(`Error during ${currentStage}: ${err instanceof Error ? err.message : "An unknown error occurred."}`);
    } finally {
      setIsProcessing(false);
      setCurrentStage("");
    }
  }, [currentStage]); 

  const renderContent = () => {
    if (isProcessing) {
      return (
        <Card className="shadow-xl bg-card/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <LoadingIndicator text={currentStage || "Processing your resume..."} />
          </CardContent>
        </Card>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive" className="shadow-lg">
          <ShieldAlert className="h-5 w-5"/>
          <AlertTitle className="font-semibold text-lg">Processing Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }
    
    if (!analysisResult) {
         return (
          <Card className="shadow-xl text-center bg-card/80 backdrop-blur-sm border border-primary/20">
            <CardHeader className="pt-10">
              <div className="mx-auto inline-block p-5 bg-primary/10 rounded-full text-primary mb-6 ring-4 ring-primary/20 animate-pulse">
                <BarChart className="w-16 h-16" />
              </div>
              <CardTitle className="text-3xl font-bold text-primary">Resume Analysis Suite</CardTitle>
            </CardHeader>
            <CardContent className="pb-10">
              <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
                Upload your resume (PDF, DOCX, JPG, PNG) to unlock AI-driven insights, scores, job matches, and a personalized career roadmap.
              </p>
              <Image 
                src="https://picsum.photos/800/400" 
                alt="Illustration of resume analysis and career growth" 
                width={800} 
                height={400}
                className="rounded-xl shadow-2xl mx-auto object-cover"
                data-ai-hint="career document"
                priority
              />
            </CardContent>
          </Card>
        );
    }

    const TABS_CONFIG = [
        { value: "analysis", icon: FileText, label: "Analysis", disabled: false },
        { value: "feedback", icon: Bot, label: "AI Chat", disabled: false },
        { value: "jobs", icon: Target, label: "Jobs", disabled: !scoreResult || scoreResult.score < 30 },
        { value: "roadmap", icon: MapPinned, label: "Roadmap", disabled: false },
        { value: "bias", icon: Filter, label: "Bias Check", disabled: false },
        { value: "courses", icon: BookOpen, label: "Courses", disabled: false },
    ];

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mb-8 p-2 bg-muted rounded-xl shadow-inner">
                {TABS_CONFIG.map(tab => (
                    <TabsTrigger 
                        key={tab.value} 
                        value={tab.value} 
                        disabled={tab.disabled}
                        className="flex items-center justify-center gap-2 py-2.5 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg rounded-lg transition-all"
                    >
                        <tab.icon size={18}/>{tab.label}
                    </TabsTrigger>
                ))}
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
                 {(!jobRecommendations || jobRecommendations.jobs.length === 0) && scoreResult && scoreResult.score < 30 && (
                    <Card className="shadow-md text-center bg-card/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-destructive">Job Recommendations Locked</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Improve your resume score to 30 or above to unlock job recommendations. Focus on enhancing clarity, quantifiable achievements, and relevance to target roles.</p>
                        </CardContent>
                    </Card>
                 )}
                  {(!jobRecommendations || jobRecommendations.jobs.length === 0) && scoreResult && scoreResult.score >= 30 && (
                    <Card className="shadow-md text-center bg-card/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-primary">No Job Recommendations Found</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">We couldn't find specific job recommendations based on your current resume. Consider broadening your search criteria or refining your resume content for more targeted results. Check back later as new jobs are added frequently.</p>
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
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-background py-10 selection:bg-primary/20 selection:text-primary">
      <div className="container mx-auto px-4">
        <header className="text-center mb-12 pt-8">
          <div className="inline-flex items-center justify-center bg-primary/10 text-primary p-4 rounded-full shadow-lg mb-6 ring-4 ring-primary/20">
            <Sparkles className="w-12 h-12" />
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary">
            Candidate Dashboard
          </h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Your personal AI career assistant. Analyze, improve, and discover opportunities.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 lg:sticky lg:top-8 space-y-8">
            <ResumeUploadForm onAnalyze={handleAnalyzeResume} isProcessing={isProcessing} />
             <Card className="bg-card/80 backdrop-blur-sm shadow-lg border border-primary/10">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold text-primary flex items-center">
                        <Info className="mr-2.5 h-6 w-6 shrink-0"/> Quick Guide
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-3">
                    <p><span className="font-semibold text-foreground">1. Upload Resume:</span> Use PDF, DOCX, JPG, or PNG formats.</p>
                    <p><span className="font-semibold text-foreground">2. AI Processing:</span> We extract key info, score your resume, and generate initial recommendations.</p>
                    <p><span className="font-semibold text-foreground">3. Explore Insights:</span> Use the tabs above to dive deeper:</p>
                    <ul className="list-none pl-4 space-y-1.5">
                        <li className="flex items-start"><FileText className="mr-2 mt-0.5 h-4 w-4 text-primary shrink-0"/><div><span className="font-medium">Analysis:</span> View parsed data & overall score.</div></li>
                        <li className="flex items-start"><Bot className="mr-2 mt-0.5 h-4 w-4 text-primary shrink-0"/><div><span className="font-medium">AI Chat:</span> Ask specific questions about your resume.</div></li>
                        <li className="flex items-start"><Target className="mr-2 mt-0.5 h-4 w-4 text-primary shrink-0"/><div><span className="font-medium">Jobs:</span> Get job recommendations (if score ≥ 30).</div></li> 
                        <li className="flex items-start"><MapPinned className="mr-2 mt-0.5 h-4 w-4 text-primary shrink-0"/><div><span className="font-medium">Roadmap:</span> Generate a career plan to your target role.</div></li>
                        <li className="flex items-start"><Filter className="mr-2 mt-0.5 h-4 w-4 text-primary shrink-0"/><div><span className="font-medium">Bias Check:</span> Get inclusivity suggestions.</div></li>
                        <li className="flex items-start"><BookOpen className="mr-2 mt-0.5 h-4 w-4 text-primary shrink-0"/><div><span className="font-medium">Courses:</span> Find relevant learning resources.</div></li>
                    </ul>
                     <p className="text-xs text-muted-foreground/80 pt-2 border-t border-border/50">
                        <Lightbulb className="inline h-3.5 w-3.5 mr-1 text-accent"/> For best results, ensure your resume is up-to-date and clearly formatted.
                    </p>
                </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-8 space-y-8">
            {renderContent()}
          </div>
        </div>
         <footer className="text-center mt-20 py-10 border-t border-border/50">
            <p className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} ResumeAce. Candidate Portal.
            </p>
            <p className="text-xs text-muted-foreground/80 mt-2">
                All suggestions are AI-generated. Please verify critical information independently for accuracy.
            </p>
        </footer>
      </div>
    </div>
  );
}

export default function CandidatePortalPage() {
  return (
    <AuthGuard>
      <CandidatePortalContent />
    </AuthGuard>
  );
}
