// src/app/recruiter-portal/page.tsx
"use client";

import React, { useState, useCallback, useRef } from 'react';
import { AuthGuard } from '@/components/auth-guard'; 
import { UploadCloud, FileText as FileTextIcon, Edit3, CheckCircle, XCircle, BookOpen, Target, Sparkles, ShieldAlert, Info, Download, Brain, MessageSquareMore, FileSignature } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { LoadingIndicator } from '@/components/loading-indicator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { fileToDataUri } from '@/lib/file-utils';
import { matchResumeToJd, type RecruiterMatchInput, type RecruiterMatchOutput } from '@/ai/flows/recruiter-matcher-flow';
import { generateFeedbackHtml, type FeedbackHtmlOutput } from '@/ai/flows/feedback-pdf-generator-flow'; // New import
import { analyzeResume, type AnalyzeResumeOutput } from '@/ai/flows/resume-analyzer'; // For feedback PDF
import { downloadHtml } from '@/lib/download-utils'; // For HTML download
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const acceptedFileTypes: Record<string, string[]> = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'image/jpeg': ['.jpeg', '.jpg'],
  'image/png': ['.png'],
};
const acceptedFileExtensions = Object.values(acceptedFileTypes).flat().join(',');

const jdTemplates = [
  { label: "Software Engineer (General)", value: "We are seeking a motivated Software Engineer to design, develop, and maintain high-quality software solutions. Responsibilities include coding, testing, debugging, and collaborating with cross-functional teams. Proficiency in one or more programming languages (e.g., Java, Python, C++), understanding of data structures and algorithms, and experience with version control systems (e.g., Git) are required. Strong problem-solving skills and a bachelor's degree in Computer Science or a related field are essential. Experience with cloud platforms (AWS, Azure, GCP) and agile methodologies is a plus." },
  { label: "Data Analyst", value: "We are looking for a Data Analyst to interpret data, analyze results using statistical techniques, and provide ongoing reports. You will develop and implement databases, data collection systems, data analytics, and other strategies that optimize statistical efficiency and quality. Strong analytical skills with the ability to collect, organize, analyze, and disseminate significant amounts of information with attention to detail and accuracy are crucial. Proficiency in SQL, Excel, and data visualization tools (e.g., Tableau, Power BI) is required. Experience with Python or R for data analysis is highly desirable." },
  { label: "Frontend Developer", value: "Seeking a Frontend Developer to create user-friendly web pages and interfaces. You will be responsible for translating UI/UX design wireframes into actual code that will produce visual elements of the application. Proficiency in HTML, CSS, JavaScript, and modern frontend frameworks (e.g., React, Angular, Vue.js) is essential. Experience with responsive design, cross-browser compatibility, and version control (Git) is required. Familiarity with RESTful APIs and build tools like Webpack or Parcel is a plus." },
  { label: "Marketing Specialist", value: "Join our team as a Marketing Specialist to develop and implement marketing strategies that strengthen our company’s market presence and help it find a 'voice' that will make a difference. You will conduct market research, manage digital campaigns (SEO/SEM, email, social media), create compelling content, and analyze campaign performance. Strong communication, creativity, and analytical skills are essential. Experience with marketing automation tools, CRM software, and Google Analytics is preferred." },
];


function RecruiterPortalContent() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>('');
  const [matchResult, setMatchResult] = useState<RecruiterMatchOutput | null>(null);
  const [resumeAnalysisForPdf, setResumeAnalysisForPdf] = useState<AnalyzeResumeOutput | null>(null); // For feedback PDF
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = useCallback((file: File | null) => {
    if (file) {
      if (!acceptedFileTypes[file.type as keyof typeof acceptedFileTypes]) {
        toast({
          title: "Invalid File Type",
          description: `Please upload a PDF, DOCX, JPEG, or PNG file. You uploaded: ${file.name}`,
          variant: "destructive",
        });
        setResumeFile(null);
        if (resumeInputRef.current) resumeInputRef.current.value = "";
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File Too Large",
          description: `Please upload a file smaller than 5MB. Your file is ${(file.size / (1024*1024)).toFixed(2)}MB.`,
          variant: "destructive",
        });
        setResumeFile(null);
        if (resumeInputRef.current) resumeInputRef.current.value = "";
        return;
      }
      setResumeFile(file);
    } else {
      setResumeFile(null);
    }
  }, [toast]);

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  }, [handleFileChange]);

  const onBrowseClick = () => resumeInputRef.current?.click();
  const removeFile = useCallback(() => {
    setResumeFile(null);
    if(resumeInputRef.current) resumeInputRef.current.value = "";
  }, []);

  const handleSubmit = async () => {
    if (!resumeFile || !jobDescription.trim()) {
      setError("Please upload a resume and provide a job description.");
      toast({
        title: "Missing Information",
        description: "Ensure both a resume file is uploaded and a job description is provided.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setMatchResult(null);
    setResumeAnalysisForPdf(null);

    try {
      const resumeDataUri = await fileToDataUri(resumeFile);
      
      // Run resume analysis for feedback PDF context
      const analysis = await analyzeResume({ resumeDataUri });
      setResumeAnalysisForPdf(analysis);

      const input: RecruiterMatchInput = {
        resumeDataUri,
        jobDescriptionText: jobDescription,
      };
      const result = await matchResumeToJd(input);
      setMatchResult(result);
      toast({
        title: "Evaluation Complete",
        description: `Resume matched against JD with a score of ${result.fitmentScore}.`,
        variant: "default",
      });
    } catch (err) {
      console.error("Error matching resume to JD:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred during evaluation.");
      toast({
        title: "Evaluation Failed",
        description: err instanceof Error ? err.message : "Could not evaluate resume against JD.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadFeedback = async () => {
    if (!matchResult || !resumeAnalysisForPdf) {
      toast({ title: "Error", description: "Match result or resume analysis not available for feedback generation.", variant: "destructive"});
      return;
    }
    setIsGeneratingFeedback(true);
    try {
      const feedbackInput = {
        matchData: matchResult,
        resumeAnalysis: resumeAnalysisForPdf,
        jobDescriptionTitle: "Position being evaluated" // Placeholder, ideally extract from JD or input
      };
      const feedbackOutput: FeedbackHtmlOutput = await generateFeedbackHtml(feedbackInput);
      downloadHtml(feedbackOutput.htmlContent, feedbackOutput.suggestedFilename);
      toast({
        title: "Feedback Report Generated",
        description: `${feedbackOutput.suggestedFilename} has been downloaded.`,
      });
    } catch (err) {
      console.error("Error generating feedback HTML:", err);
      toast({ title: "Feedback Generation Failed", description: err instanceof Error ? err.message : "Could not generate feedback.", variant: "destructive" });
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  const getScoreColorClass = (score: number): string => {
    if (score >= 70) return 'text-green-500 dark:text-green-400';
    if (score >= 50) return 'text-yellow-500 dark:text-yellow-400';
    return 'text-red-500 dark:text-red-400';
  };
  
  const getAssessmentBadgeVariant = (assessment: string): "default" | "secondary" | "destructive" | "outline" => {
    const lowerAssessment = assessment.toLowerCase();
    if (lowerAssessment.includes("excellent") || lowerAssessment.includes("strong")) return "default"; 
    if (lowerAssessment.includes("good") || lowerAssessment.includes("fair")) return "secondary";
    return "destructive";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-background py-10 selection:bg-primary/20 selection:text-primary">
      <div className="container mx-auto px-4">
        <header className="mb-12 pt-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center bg-primary/10 text-primary p-4 rounded-full shadow-lg mb-6 ring-4 ring-primary/20">
              <Target className="w-12 h-12" />
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary">
              Recruiter Matching Suite
            </h1>
            <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Efficiently evaluate candidate resumes against job descriptions using AI-powered analysis.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <Card className="shadow-xl bg-card/80 backdrop-blur-sm border border-primary/10 hover:border-primary/30 transition-all">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl text-primary"><UploadCloud className="mr-3 h-7 w-7"/> Upload Candidate Resume</CardTitle>
              <CardDescription className="text-md">Select a resume file (PDF, DOCX, JPG, PNG - max 5MB).</CardDescription>
            </CardHeader>
            <CardContent>
               <div
                className={cn(
                  "flex flex-col items-center justify-center w-full h-60 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-300 ease-in-out",
                  dragActive ? "border-primary bg-primary/10 ring-4 ring-primary/20" : "border-border hover:border-primary/70 hover:bg-accent/5",
                  resumeFile ? "border-primary bg-primary/5" : ""
                )}
                onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                onClick={resumeFile ? undefined : onBrowseClick}
              >
                {resumeFile ? (
                  <div className="text-center p-4">
                    <FileTextIcon className="w-16 h-16 mb-3 text-primary mx-auto" />
                    <p className="text-md text-foreground font-semibold break-all px-2">{resumeFile.name}</p>
                    <p className="text-sm text-muted-foreground">({(resumeFile.size / (1024*1024)).toFixed(2)} MB)</p>
                    <Button variant="ghost" size="sm" onClick={(e) => {e.stopPropagation(); removeFile();}} className="mt-3 text-destructive hover:text-destructive-foreground hover:bg-destructive/80 text-sm">
                      <XCircle className="mr-1.5 h-4 w-4" /> Remove File
                    </Button>
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <UploadCloud className={cn("w-16 h-16 mb-3 mx-auto transition-colors", dragActive ? "text-primary animate-pulse" : "text-muted-foreground group-hover:text-primary")} />
                    <p className={cn("text-lg font-medium", dragActive ? "text-primary" : "text-foreground/90")}>
                      <span className="text-primary group-hover:text-accent transition-colors">Click to upload</span> or drag & drop
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">PDF, DOCX, JPG, PNG supported</p>
                  </div>
                )}
                <input
                  ref={resumeInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
                  accept={acceptedFileExtensions}
                  disabled={isLoading}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl bg-card/80 backdrop-blur-sm border border-primary/10 hover:border-primary/30 transition-all">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center text-2xl text-primary"><Edit3 className="mr-3 h-7 w-7"/> Job Description</CardTitle>
                <Select onValueChange={(value) => setJobDescription(value)} disabled={isLoading}>
                  <SelectTrigger className="w-[200px] text-xs">
                    <SelectValue placeholder="Use Template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {jdTemplates.map(template => (
                      <SelectItem key={template.label} value={template.value} className="text-xs">
                        {template.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <CardDescription className="text-md">Paste the full job description or use a template.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Paste the complete job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={8} // Reduced rows slightly to accommodate select
                className="resize-none text-sm bg-background/70 border-border focus:border-primary focus:ring-primary rounded-xl p-4"
                disabled={isLoading}
              />
            </CardContent>
          </Card>
        </div>

        <div className="mt-10 text-center">
          <Button onClick={handleSubmit} disabled={isLoading || !resumeFile || !jobDescription.trim()} size="lg" className="px-10 py-6 text-lg">
            {isLoading ? <LoadingIndicator size="sm" text="Evaluating Fitment..." /> : 'Evaluate Candidate Fit'}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mt-10 shadow-lg">
            <ShieldAlert className="h-5 w-5"/>
            <AlertTitle className="font-semibold text-lg">Evaluation Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {matchResult && !isLoading && (
          <Card className="mt-12 shadow-2xl border-t-4 border-primary bg-card/90 backdrop-blur-lg">
            <CardHeader className="text-center pt-8 pb-6">
                <div className="inline-block p-4 bg-primary/10 rounded-full mx-auto mb-4 ring-4 ring-primary/20">
                    <Sparkles className={cn("w-12 h-12", getScoreColorClass(matchResult.fitmentScore))} />
                </div>
              <CardTitle className="text-4xl font-bold">Candidate Fitment Report</CardTitle>
              <div className="flex justify-center mt-4">
                <Button onClick={handleDownloadFeedback} variant="outline" size="sm" disabled={isGeneratingFeedback}>
                  {isGeneratingFeedback ? <LoadingIndicator size="xs" text="Generating..." /> : <><Download className="mr-2 h-4 w-4" />Download Feedback Report</>}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-8 px-4 md:px-8 pb-8">
              <div className="text-center">
                <p className={cn("text-8xl font-extrabold mb-1", getScoreColorClass(matchResult.fitmentScore))}>
                  {matchResult.fitmentScore}
                  <span className="text-4xl text-muted-foreground">/100</span>
                </p>
                <Badge variant={getAssessmentBadgeVariant(matchResult.assessment)} className="text-xl px-6 py-2 rounded-full shadow-md">
                  {matchResult.assessment}
                </Badge>
                <Progress value={matchResult.fitmentScore} className="h-3 mt-4 max-w-md mx-auto rounded-full" />
              </div>

              <Card className="bg-secondary/20 border-border/50 shadow-inner">
                <CardHeader><CardTitle className="text-xl text-primary flex items-center"><MessageSquareMore className="mr-2 h-5 w-5"/>AI Reasoning</CardTitle></CardHeader>
                <CardContent><p className="text-md text-foreground/90 leading-relaxed">{matchResult.reasoning}</p></CardContent>
              </Card>
              
              {matchResult.jdSkillsAnalysis && (
                <Card className="bg-blue-500/5 border-blue-500/30 shadow-md">
                    <CardHeader><CardTitle className="text-lg flex items-center text-blue-700 dark:text-blue-300"><Brain className="mr-2.5 h-6 w-6"/>Detailed Skills Breakdown</CardTitle></CardHeader>
                    <CardContent className="text-sm space-y-2">
                        <p><strong>Identified Skills in JD:</strong> {matchResult.jdSkillsAnalysis.identifiedSkillsInJd.join(', ') || 'N/A'}</p>
                        <p className="text-green-600"><strong>Mandatory Skills Met:</strong> {matchResult.jdSkillsAnalysis.mandatorySkillsMet.join(', ') || 'None'}</p>
                        <p className="text-green-500"><strong>Optional Skills Met:</strong> {matchResult.jdSkillsAnalysis.optionalSkillsMet.join(', ') || 'None'}</p>
                        <p className="text-red-600"><strong>Missing Mandatory Skills:</strong> {matchResult.jdSkillsAnalysis.missingMandatorySkills.join(', ') || 'None'}</p>
                        {matchResult.jdSkillsAnalysis.missingOptionalSkills && matchResult.jdSkillsAnalysis.missingOptionalSkills.length > 0 &&
                            <p className="text-amber-600"><strong>Missing Optional Skills:</strong> {matchResult.jdSkillsAnalysis.missingOptionalSkills.join(', ') || 'None'}</p>
                        }
                        <p><strong>Additional Skills in Resume (Not in JD):</strong> {matchResult.jdSkillsAnalysis.additionalSkillsInResume.join(', ') || 'None'}</p>
                        <AlertDescription className="text-xs mt-2">
                            Counts: {matchResult.jdSkillsAnalysis.mandatorySkillsMet.length + matchResult.jdSkillsAnalysis.optionalSkillsMet.length} / {matchResult.jdSkillsAnalysis.identifiedSkillsInJd.length} JD skills matched.
                        </AlertDescription>
                    </CardContent>
                </Card>
              )}


              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-green-500/5 border-green-500/30 shadow-md">
                  <CardHeader><CardTitle className="text-lg flex items-center text-green-600 dark:text-green-400"><CheckCircle className="mr-2.5 h-6 w-6"/>Key Strengths & Matches</CardTitle></CardHeader>
                  <CardContent>
                    {matchResult.keyMatches && matchResult.keyMatches.length > 0 ? (
                      <ul className="list-disc list-inside space-y-1.5 text-sm text-foreground/90">
                        {matchResult.keyMatches.map((match, index) => <li key={index}>{match}</li>)}
                      </ul>
                    ) : <p className="text-sm text-muted-foreground">No strong matches identified by the AI.</p>}
                  </CardContent>
                </Card>
                <Card className="bg-red-500/5 border-red-500/30 shadow-md">
                  <CardHeader><CardTitle className="text-lg flex items-center text-red-600 dark:text-red-400"><XCircle className="mr-2.5 h-6 w-6"/>Skill Gaps & Mismatches</CardTitle></CardHeader>
                  <CardContent>
                    {matchResult.keyMismatches && matchResult.keyMismatches.length > 0 ? (
                      <ul className="list-disc list-inside space-y-1.5 text-sm text-foreground/90">
                        {matchResult.keyMismatches.map((mismatch, index) => <li key={index}>{mismatch}</li>)}
                      </ul>
                    ) : <p className="text-sm text-muted-foreground">No significant gaps identified by the AI.</p>}
                  </CardContent>
                </Card>
              </div>

              {matchResult.courseRecommendations && matchResult.courseRecommendations.length > 0 && (
                <Card className="bg-accent/5 border-accent/30 shadow-md">
                  <CardHeader><CardTitle className="text-xl flex items-center text-accent"><BookOpen className="mr-2.5 h-6 w-6"/>Suggested Learning for Candidate</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">To bridge identified skill gaps, consider suggesting the following learning paths to the candidate:</p>
                    {matchResult.courseRecommendations.map((course, index) => (
                      <div key={index} className="p-4 border border-border/50 rounded-lg bg-card shadow-sm">
                        <h4 className="font-semibold text-lg text-primary">{course.title}</h4>
                        <p className="text-xs text-muted-foreground mb-1">
                          Platform: <span className="font-medium">{course.platform}</span> 
                          {course.focusArea && <> | Focus: <span className="font-medium">{course.focusArea}</span></>}
                        </p>
                        <p className="text-sm mt-1 text-foreground/90">{course.description}</p>
                        {course.url && <a href={course.url} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline mt-1 inline-block">View Course &rarr;</a>}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
              <Alert variant="default" className="mt-6 bg-blue-500/5 border-blue-500/20 text-blue-700 dark:text-blue-300 dark:border-blue-500/50">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <AlertTitle className="font-semibold text-blue-800 dark:text-blue-200">Disclaimer</AlertTitle>
                <AlertDescription className="text-sm">
                    This AI-generated report provides an initial assessment. Always conduct thorough interviews and further evaluations to make final hiring decisions.
                </AlertDescription>
            </Alert>
            </CardContent>
          </Card>
        )}
        <footer className="text-center mt-20 py-10 border-t border-border/50">
            <p className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} ResumeAce Recruiter Suite.
            </p>
             <p className="text-xs text-muted-foreground/80 mt-2">
                AI insights for informed hiring.
            </p>
        </footer>
      </div>
    </div>
  );
}

export default function RecruiterPortalPage() {
  return (
    <AuthGuard>
      <RecruiterPortalContent />
    </AuthGuard>
  );
}

