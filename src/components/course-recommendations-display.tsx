// src/components/course-recommendations-display.tsx
"use client";

import React, { useState, useEffect } from 'react';
import type { AnalyzeResumeOutput } from '@/ai/flows/resume-analyzer';
import { getCourseRecommendations, type CourseRecommenderOutput, type RecommendedCourse } from '@/ai/flows/course-recommender-flow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingIndicator } from './loading-indicator';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { BookOpenCheck, ExternalLink, Sparkles, Info, GraduationCap } from 'lucide-react';
import { Badge } from './ui/badge';

interface CourseRecommendationsDisplayProps {
  analysisResult: AnalyzeResumeOutput | null;
  targetRole?: string; // Optional, can be taken from career roadmap or a specific input
  triggerAnalysis?: boolean;
}

export function CourseRecommendationsDisplay({ analysisResult, targetRole, triggerAnalysis = false }: CourseRecommendationsDisplayProps) {
  const [recommendations, setRecommendations] = useState<CourseRecommenderOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisPerformed, setAnalysisPerformed] = useState(false);
  const [effectiveTargetRole, setEffectiveTargetRole] = useState(targetRole || "");

  const fetchRecommendations = async (roleToUse: string) => {
    if (!analysisResult || !roleToUse) {
      setError("Resume analysis and target role are needed for course recommendations.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setRecommendations(null);

    try {
      const result = await getCourseRecommendations({
        currentSkills: analysisResult.skills || [],
        targetRole: roleToUse,
        // skillGaps and areasForImprovement could be derived from other analyses in a more complex setup
      });
      setRecommendations(result);
      setAnalysisPerformed(true);
    } catch (err) {
      console.error("Error getting course recommendations:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (targetRole) {
      setEffectiveTargetRole(targetRole);
    }
  }, [targetRole]);
  
  useEffect(() => {
    if (triggerAnalysis && analysisResult && effectiveTargetRole && !analysisPerformed && !isLoading) {
      fetchRecommendations(effectiveTargetRole);
    }
  }, [triggerAnalysis, analysisResult, effectiveTargetRole, analysisPerformed, isLoading]);

  const handleFetchClick = () => {
    if (!effectiveTargetRole && analysisResult) {
        // Try to infer a target role if not provided, e.g. from job recommendations (if available and complex enough)
        // For simplicity, we'll prompt or use a default if analysisResult.experience exists
        const inferredRole = analysisResult.experience?.split('\n')[0]?.split(' at ')[0] || "your current field";
        if(inferredRole && inferredRole !== "your current field"){
            setEffectiveTargetRole(inferredRole); // Set it for display and potential use
            fetchRecommendations(inferredRole);
        } else {
            setError("Please specify a target role, or let the Career Roadmap suggest one first.");
        }
    } else if (effectiveTargetRole) {
        fetchRecommendations(effectiveTargetRole);
    }
  };


  if (!analysisResult) {
    return null;
  }

  return (
    <Card className="shadow-lg mt-8">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <span className="p-2 bg-accent/10 rounded-md text-accent">
            <GraduationCap className="w-7 h-7" />
          </span>
          <div>
            <CardTitle className="text-2xl font-bold text-accent">Learning Recommendations</CardTitle>
            <CardDescription>AI-suggested courses and resources to achieve your career goals {effectiveTargetRole && `for ${effectiveTargetRole}`}.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!analysisPerformed && !isLoading && (
             <div className="text-center py-4">
                {!effectiveTargetRole && <p className="text-muted-foreground mb-2">Enter a target role (or let the Roadmap generate one) to get learning suggestions.</p>}
                <Button onClick={handleFetchClick} disabled={isLoading || !effectiveTargetRole}>
                    {isLoading ? <LoadingIndicator size="sm" text="Fetching..." /> : `Get Courses for ${effectiveTargetRole || 'Target Role'}`}
                </Button>
            </div>
        )}

        {isLoading && <LoadingIndicator text="Fetching course recommendations..." />}

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {recommendations && !isLoading && (
          <div className="mt-4 space-y-6">
            {recommendations.generalAdvice && (
              <Alert variant="default" className="bg-primary/5 border-primary/20">
                <Info className="h-5 w-5 text-primary" />
                <AlertTitle className="font-semibold text-primary">General Learning Advice</AlertTitle>
                <AlertDescription className="text-sm text-primary/90">
                  {recommendations.generalAdvice}
                </AlertDescription>
              </Alert>
            )}

            {recommendations.recommendations && recommendations.recommendations.length > 0 ? (
              <div className="space-y-4">
                {recommendations.recommendations.map((course, index) => (
                  <Card key={index} className="bg-card border hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-lg text-primary">{course.title}</CardTitle>
                            <CardDescription className="text-sm">
                                On <span className="font-medium">{course.platform}</span>
                                {course.focusArea && ` - Focus: ${course.focusArea}`}
                            </CardDescription>
                        </div>
                        {course.url && (
                            <Button variant="outline" size="sm" asChild>
                                <a href={course.url} target="_blank" rel="noopener noreferrer">
                                    Visit <ExternalLink className="ml-1.5 h-4 w-4" />
                                </a>
                            </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{course.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No specific course recommendations available at this time.</p>
            )}
             <Button onClick={() => fetchRecommendations(effectiveTargetRole)} variant="outline" disabled={isLoading || !effectiveTargetRole}>
                {isLoading ? <LoadingIndicator size="sm" text="Refreshing..." /> : 'Refresh Recommendations'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
