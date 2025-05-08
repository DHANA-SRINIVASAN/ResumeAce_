// src/components/bias-detection-display.tsx
"use client";

import React, { useState, useEffect } from 'react';
import type { AnalyzeResumeOutput } from '@/ai/flows/resume-analyzer';
import { detectBiasInResume, type BiasDetectionOutput, type DetectedBias } from '@/ai/flows/bias-detection-flow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingIndicator } from './loading-indicator';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Scale, ShieldCheck, MessageCircleWarning, Lightbulb, ThumbsUp } from 'lucide-react';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

interface BiasDetectionDisplayProps {
  analysisResult: AnalyzeResumeOutput | null;
  triggerAnalysis?: boolean; // Optional prop to trigger analysis automatically
}

export function BiasDetectionDisplay({ analysisResult, triggerAnalysis = false }: BiasDetectionDisplayProps) {
  const [biasReport, setBiasReport] = useState<BiasDetectionOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisPerformed, setAnalysisPerformed] = useState(false);

  const performBiasAnalysis = async () => {
    if (!analysisResult) {
      setError("Resume analysis data is not available. Please analyze your resume first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setBiasReport(null);

    try {
       // Combine relevant parts of the resume for bias analysis
      const resumeTextForBiasCheck = `
        Name: ${analysisResult.name}
        Contact: ${analysisResult.contactDetails}
        Skills: ${analysisResult.skills?.join(', ')}
        Education: ${analysisResult.education}
        Experience: ${analysisResult.experience}
        Projects: ${analysisResult.projects?.join('\n')}
      `.trim();

      const result = await detectBiasInResume({ resumeText: resumeTextForBiasCheck });
      setBiasReport(result);
      setAnalysisPerformed(true);
    } catch (err) {
      console.error("Error detecting bias:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred during bias detection.");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (triggerAnalysis && analysisResult && !analysisPerformed && !isLoading) {
      performBiasAnalysis();
    }
  }, [triggerAnalysis, analysisResult, analysisPerformed, isLoading]);


  if (!analysisResult) {
    return null; 
  }


  return (
    <Card className="shadow-lg mt-8">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <span className="p-2 bg-primary/10 rounded-md text-primary">
            <Scale className="w-7 h-7" />
          </span>
          <div>
            <CardTitle className="text-2xl font-bold text-primary">Inclusivity & Bias Check</CardTitle>
            <CardDescription>AI-powered analysis to help make your resume more inclusive.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!analysisPerformed && !isLoading && (
             <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">Check your resume for potential biases and get suggestions for more inclusive language.</p>
                <Button onClick={performBiasAnalysis} disabled={isLoading}>
                    {isLoading ? <LoadingIndicator size="sm" text="Analyzing..." /> : 'Analyze for Bias'}
                </Button>
            </div>
        )}
        
        {isLoading && <LoadingIndicator text="Checking for biases..." />}

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {biasReport && !isLoading && (
          <div className="mt-4 space-y-6">
            <Alert variant={biasReport.detectedItems.length === 0 ? "default" : "default"} 
                   className={biasReport.detectedItems.length === 0 ? "border-green-500 bg-green-50" : "border-amber-500 bg-amber-50"}>
              {biasReport.detectedItems.length === 0 ? <ShieldCheck className="h-5 w-5 text-green-600" /> : <MessageCircleWarning className="h-5 w-5 text-amber-600" />}
              <AlertTitle className={biasReport.detectedItems.length === 0 ? "text-green-700 font-semibold" : "text-amber-700 font-semibold"}>
                Overall Assessment
              </AlertTitle>
              <AlertDescription className={biasReport.detectedItems.length === 0 ? "text-green-600" : "text-amber-600"}>
                {biasReport.overallAssessment}
              </AlertDescription>
            </Alert>

            {biasReport.positiveNotes && biasReport.positiveNotes.length > 0 && (
                <div>
                    <h4 className="text-md font-semibold text-accent flex items-center mb-2">
                        <ThumbsUp className="w-4 h-4 mr-2"/> Positive Aspects Noted:
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {biasReport.positiveNotes.map((note, index) => (
                            <li key={index}>{note}</li>
                        ))}
                    </ul>
                </div>
            )}


            {biasReport.detectedItems.length > 0 && (
              <div>
                <h4 className="text-md font-semibold text-foreground mb-2">Potential Areas for Improvement:</h4>
                <div className="space-y-4">
                  {biasReport.detectedItems.map((item, index) => (
                    <Card key={index} className="bg-card border rounded-lg overflow-hidden">
                      <CardHeader className="p-4 bg-muted/50">
                        <CardTitle className="text-base font-medium text-primary flex items-center">
                           <MessageCircleWarning className="w-5 h-5 mr-2 text-destructive"/>
                           {item.biasType}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-2 text-sm">
                        {item.originalText && (
                          <p><span className="font-semibold text-foreground">Original Text:</span> <em className="text-muted-foreground">"{item.originalText}"</em></p>
                        )}
                        <p><span className="font-semibold text-foreground">Suggestion:</span> <span className="text-accent">{item.suggestion}</span></p>
                        <p><span className="font-semibold text-foreground">Explanation:</span> <span className="text-muted-foreground">{item.explanation}</span></p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
             <Separator className="my-6"/>
             <Button onClick={performBiasAnalysis} variant="outline" disabled={isLoading}>
                {isLoading ? <LoadingIndicator size="sm" text="Re-analyzing..." /> : 'Re-analyze for Bias'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
