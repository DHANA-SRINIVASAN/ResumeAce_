// src/app/recruiter-portal/page.tsx
"use client";

import React, { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { AuthGuard } from '@/components/auth-guard'; // Import AuthGuard
import { ArrowLeft, UploadCloud, FileText as FileTextIcon, Edit3, CheckCircle, XCircle, BookOpen, Target, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { LoadingIndicator } from '@/components/loading-indicator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { fileToDataUri } from '@/lib/file-utils';
import { matchResumeToJd, type RecruiterMatchInput, type RecruiterMatchOutput } from '@/ai/flows/recruiter-matcher-flow';
import { cn } from '@/lib/utils';

const acceptedFileTypes: Record<string, string[]> = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'image/jpeg': ['.jpeg', '.jpg'],
  'image/png': ['.png'],
};
const acceptedFileExtensions = Object.values(acceptedFileTypes).flat().join(',');

function RecruiterPortalContent() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>('');
  const [matchResult, setMatchResult] = useState<RecruiterMatchOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
      return;
    }

    setIsLoading(true);
    setError(null);
    setMatchResult(null);

    try {
      const resumeDataUri = await fileToDataUri(resumeFile);
      const input: RecruiterMatchInput = {
        resumeDataUri,
        jobDescriptionText: jobDescription,
      };
      const result = await matchResumeToJd(input);
      setMatchResult(result);
    } catch (err) {
      console.error("Error matching resume to JD:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
      toast({
        title: "Evaluation Failed",
        description: err instanceof Error ? err.message : "Could not evaluate resume against JD.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 70) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  const getAssessmentBadgeVariant = (assessment: string): "default" | "secondary" | "destructive" | "outline" => {
    if (assessment.toLowerCase().includes("excellent") || assessment.toLowerCase().includes("strong")) return "default";
    if (assessment.toLowerCase().includes("good") || assessment.toLowerCase().includes("fair")) return "secondary";
    return "destructive";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 py-8">
      <div className="container mx-auto px-4">
        <header className="mb-12">
           {/* Removed back to candidate portal link, handled by main sidebar nav */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center bg-primary text-primary-foreground p-3 rounded-lg shadow-lg mb-4">
              <Target className="w-10 h-10" />
            </div>
            <h1 className="text-5xl font-extrabold text-primary tracking-tight">
              Recruiter Matching Portal
            </h1>
            <p className="mt-3 text-xl text-muted-foreground max-w-2xl mx-auto">
              Upload a resume and job description to evaluate candidate fitment.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center"><UploadCloud className="mr-2 h-6 w-6 text-primary"/> Upload Candidate Resume</CardTitle>
              <CardDescription>Select a resume file (PDF, DOCX, JPG, PNG - max 5MB).</CardDescription>
            </CardHeader>
            <CardContent>
               <div
                className={cn(
                  "flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                  dragActive ? "border-primary bg-primary/10" : "border-border hover:border-primary/70 hover:bg-accent/5",
                  resumeFile ? "border-primary" : ""
                )}
                onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                onClick={resumeFile ? undefined : onBrowseClick}
              >
                {resumeFile ? (
                  <div className="text-center">
                    <FileTextIcon className="w-10 h-10 mb-2 text-primary mx-auto" />
                    <p className="text-sm text-foreground font-semibold break-all px-2">{resumeFile.name}</p>
                    <p className="text-xs text-muted-foreground">({(resumeFile.size / 1024).toFixed(2)} KB)</p>
                    <Button variant="ghost" size="sm" onClick={(e) => {e.stopPropagation(); removeFile();}} className="mt-1 text-destructive hover:text-destructive/80">
                      <XCircle className="mr-1 h-4 w-4" /> Remove
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <UploadCloud className={cn("w-10 h-10 mb-2 mx-auto", dragActive ? "text-primary" : "text-muted-foreground")} />
                    <p className={cn("text-sm", dragActive ? "text-primary" : "text-muted-foreground")}>
                      <span className="font-semibold">Click to upload</span> or drag & drop
                    </p>
                    <p className="text-xs text-muted-foreground">PDF, DOCX, JPG, PNG</p>
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

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center"><Edit3 className="mr-2 h-6 w-6 text-primary"/> Paste Job Description</CardTitle>
              <CardDescription>Enter the full job description text below.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Paste the job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={8}
                className="resize-none"
                disabled={isLoading}
              />
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Button onClick={handleSubmit} disabled={isLoading || !resumeFile || !jobDescription.trim()} size="lg">
            {isLoading ? <LoadingIndicator size="sm" text="Evaluating..." /> : 'Evaluate Fitment'}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mt-8 shadow-md">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {matchResult && !isLoading && (
          <Card className="mt-12 shadow-xl">
            <CardHeader className="text-center">
                <div className="inline-block p-3 bg-primary/10 rounded-full mx-auto mb-3">
                    <Sparkles className={cn("w-10 h-10", getScoreColor(matchResult.fitmentScore))} />
                </div>
              <CardTitle className="text-3xl font-bold">Fitment Evaluation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className={cn("text-7xl font-extrabold mb-1", getScoreColor(matchResult.fitmentScore))}>
                  {matchResult.fitmentScore}
                  <span className="text-3xl text-muted-foreground">/100</span>
                </p>
                <Badge variant={getAssessmentBadgeVariant(matchResult.assessment)} className="text-lg px-4 py-1">
                  {matchResult.assessment}
                </Badge>
              </div>

              <Card className="bg-secondary/30">
                <CardHeader><CardTitle className="text-xl text-primary">Reasoning</CardTitle></CardHeader>
                <CardContent><p className="text-sm">{matchResult.reasoning}</p></CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader><CardTitle className="text-lg flex items-center text-green-600"><CheckCircle className="mr-2"/>Key Matches</CardTitle></CardHeader>
                  <CardContent>
                    {matchResult.keyMatches && matchResult.keyMatches.length > 0 ? (
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {matchResult.keyMatches.map((match, index) => <li key={index}>{match}</li>)}
                      </ul>
                    ) : <p className="text-sm text-muted-foreground">No strong matches identified.</p>}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-lg flex items-center text-red-600"><XCircle className="mr-2"/>Skill Gaps / Mismatches</CardTitle></CardHeader>
                  <CardContent>
                    {matchResult.keyMismatches && matchResult.keyMismatches.length > 0 ? (
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {matchResult.keyMismatches.map((mismatch, index) => <li key={index}>{mismatch}</li>)}
                      </ul>
                    ) : <p className="text-sm text-muted-foreground">No significant gaps identified.</p>}
                  </CardContent>
                </Card>
              </div>

              {matchResult.courseRecommendations && matchResult.courseRecommendations.length > 0 && (
                <Card>
                  <CardHeader><CardTitle className="text-xl flex items-center text-accent"><BookOpen className="mr-2"/>Suggested Learning</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {matchResult.courseRecommendations.map((course, index) => (
                      <div key={index} className="p-3 border rounded-md bg-card">
                        <h4 className="font-semibold text-primary">{course.title}</h4>
                        <p className="text-xs text-muted-foreground">Platform: {course.platform} {course.focusArea && `| Focus: ${course.focusArea}`}</p>
                        <p className="text-sm mt-1">{course.description}</p>
                        {course.url && <a href={course.url} target="_blank" rel="noopener noreferrer" className="text-xs text-accent hover:underline">View Course &rarr;</a>}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        )}
        <footer className="text-center mt-16 py-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} ResumeAce Recruiter Portal.
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
