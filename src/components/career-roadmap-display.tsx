// src/components/career-roadmap-display.tsx
"use client";

import React, { useState } from 'react';
import type { AnalyzeResumeOutput } from '@/ai/flows/resume-analyzer';
import { generateCareerRoadmap, type CareerRoadmapOutput, type RoadmapStep } from '@/ai/flows/career-roadmap-flow';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoadingIndicator } from './loading-indicator';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { DraftingCompass, TrendingUp, Lightbulb, Award, BadgeDollarSign, CheckSquare, ExternalLink, Clock3, Info, Brain, BookOpen } from 'lucide-react';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';

interface CareerRoadmapDisplayProps {
  analysisResult: AnalyzeResumeOutput | null;
}

const SectionWrapper: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="mt-6">
    <div className="flex items-center mb-3">
      <span className="text-primary mr-2">{icon}</span>
      <h3 className="text-lg font-semibold text-primary">{title}</h3>
    </div>
    {children}
  </div>
);

export function CareerRoadmapDisplay({ analysisResult }: CareerRoadmapDisplayProps) {
  const [targetRole, setTargetRole] = useState('');
  const [roadmap, setRoadmap] = useState<CareerRoadmapOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRole.trim() || !analysisResult) {
      setError("Please enter a target role and ensure your resume has been analyzed.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setRoadmap(null);

    try {
      // Infer current role (simplified)
      const currentRole = analysisResult.experience?.split('\n')[0]?.split(' at ')[0] || "current profile";

      const result = await generateCareerRoadmap({
        resumeAnalysis: analysisResult,
        currentRole: currentRole,
        targetRole: targetRole,
      });
      setRoadmap(result);
    } catch (err) {
      console.error("Error generating career roadmap:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred while generating the roadmap.");
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!analysisResult) {
    return null; 
  }

  return (
    <Card className="shadow-lg mt-8">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <span className="p-2 bg-primary/10 rounded-md text-primary">
            <DraftingCompass className="w-7 h-7" />
          </span>
          <div>
            <CardTitle className="text-2xl font-bold text-primary">Career Roadmap Generator</CardTitle>
            <CardDescription>Enter your target role to get a personalized step-by-step plan. Inspired by resources like roadmap.sh.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 sm:flex sm:space-y-0 sm:space-x-3 items-end">
          <div className="flex-grow">
            <label htmlFor="targetRole" className="block text-sm font-medium text-foreground mb-1">Your Target Role:</label>
            <Input
              id="targetRole"
              placeholder="E.g., Senior Data Scientist, Product Manager"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              disabled={isLoading}
              className="w-full"
            />
          </div>
          <Button type="submit" disabled={isLoading || !targetRole.trim()} className="w-full sm:w-auto">
            {isLoading ? <LoadingIndicator size="sm" text="Generating..." /> : 'Generate Roadmap'}
          </Button>
        </form>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {roadmap && !isLoading && (
          <div className="mt-6 space-y-6">
            <Card className="bg-secondary/30 p-4 rounded-lg">
              <p className="text-sm text-foreground">{roadmap.introduction}</p>
            </Card>

            <SectionWrapper title="Your Actionable Steps" icon={<TrendingUp className="w-5 h-5" />}>
              <Accordion type="single" collapsible className="w-full" defaultValue="step-0">
                {roadmap.steps.map((step, index) => (
                  <AccordionItem value={`step-${index}`} key={index} className="border-border">
                    <AccordionTrigger className="hover:no-underline text-left">
                      <div className="flex items-start space-x-3">
                        <CheckSquare className="w-5 h-5 mt-1 text-accent flex-shrink-0" />
                        <span className="font-medium text-base text-foreground">{step.title}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pl-8 pr-2 space-y-3 text-sm">
                      <p className="text-muted-foreground whitespace-pre-line">{step.description}</p>
                      
                      {step.keySkillsToDevelop && step.keySkillsToDevelop.length > 0 && (
                        <div className="mt-2">
                          <p className="font-semibold text-foreground/90 mb-1 flex items-center"><Brain className="w-4 h-4 mr-2 text-primary" /> Key Skills to Develop:</p>
                          <div className="flex flex-wrap gap-2">
                            {step.keySkillsToDevelop.map((skill, i) => 
                              <Badge key={i} variant="secondary" className="text-xs">{skill}</Badge>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center text-xs text-muted-foreground mt-2">
                        <Clock3 className="w-3.5 h-3.5 mr-1.5" />
                        Estimated Timeline: {step.estimatedTimeline}
                      </div>

                      {step.resources && step.resources.length > 0 && (
                        <div className="mt-2">
                          <p className="font-semibold text-foreground/90 mb-1 flex items-center"><BookOpen className="w-4 h-4 mr-2 text-primary"/>Suggested Resources:</p>
                          <ul className="list-disc list-inside pl-1 text-muted-foreground space-y-1">
                            {step.resources.map((res, i) => <li key={i}>{res}</li>)}
                          </ul>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </SectionWrapper>
            
            <div className="grid md:grid-cols-2 gap-6">
              {roadmap.potentialCertifications && roadmap.potentialCertifications.length > 0 && (
                <SectionWrapper title="Potential Certifications" icon={<Award className="w-5 h-5" />}>
                  <div className="flex flex-wrap gap-2">
                    {roadmap.potentialCertifications.map((cert, index) => (
                       <Badge key={index} variant="outline" className="p-2 text-sm">{cert}</Badge>
                    ))}
                  </div>
                </SectionWrapper>
              )}

              {roadmap.projectIdeas && roadmap.projectIdeas.length > 0 && (
                <SectionWrapper title="Project Ideas for Portfolio" icon={<Lightbulb className="w-5 h-5" />}>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {roadmap.projectIdeas.map((idea, index) => <li key={index}>{idea}</li>)}
                  </ul>
                </SectionWrapper>
              )}
            </div>


            {roadmap.estimatedSalaryRange && (
              <SectionWrapper title="Estimated Salary Range (General)" icon={<BadgeDollarSign className="w-5 h-5" />}>
                <p className="text-lg font-semibold text-accent">{roadmap.estimatedSalaryRange}</p>
                <p className="text-xs text-muted-foreground">Note: Actual salaries vary by location, experience, and company.</p>
              </SectionWrapper>
            )}
            
            <Separator className="my-6"/>

            <CardFooter className="p-0">
                <p className="text-sm text-center w-full text-muted-foreground italic">{roadmap.closingMotivation}</p>
            </CardFooter>
            
             <Alert variant="default" className="mt-6 bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <AlertTitle className="font-semibold text-blue-800 dark:text-blue-200">Roadmap Disclaimer</AlertTitle>
                <AlertDescription className="text-sm">
                    This roadmap is AI-generated based on common career paths and your resume, aiming for a style similar to roadmap.sh. It's a guide, not a guarantee.
                    Always research specific job requirements and adapt your plan as you learn and grow.
                </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

