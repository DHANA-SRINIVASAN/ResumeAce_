// src/components/job-recommendations-display.tsx
"use client";

import type { JobRecommenderOutput, RecommendedJob } from '@/ai/flows/job-recommender';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, Building, ExternalLink, Target, MapPin, Percent, ListChecks } from 'lucide-react';
import {Progress} from "@/components/ui/progress";

interface JobRecommendationsDisplayProps {
  recommendations: JobRecommenderOutput;
}

export function JobRecommendationsDisplay({ recommendations }: JobRecommendationsDisplayProps) {
  if (!recommendations || recommendations.jobs.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-primary flex items-center">
            <Briefcase className="mr-2 h-5 w-5" />
            Job Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No job recommendations available at this time. Try adjusting your resume or criteria.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-xl border-accent border-t-4">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <span className="p-2 bg-accent/10 rounded-md text-accent">
              <Target className="w-7 h-7" />
            </span>
            <div>
              <CardTitle className="text-2xl font-bold text-accent">AI Suggested Job Matches</CardTitle>
              <CardDescription>Based on your resume, here are some potential job opportunities. Locations prioritized for India (Chennai, Bangalore, Hyderabad, Coimbatore, Trichy) if relevant.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {recommendations.jobs.map((job, index) => (
            <Card key={index} className="bg-card/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2">
                  <div className='flex-grow'>
                    <CardTitle className="text-xl text-primary">{job.title}</CardTitle>
                    <CardDescription className="text-base text-muted-foreground flex items-center">
                        <Building className="h-4 w-4 mr-1.5 text-muted-foreground shrink-0" />{job.company}
                    </CardDescription>
                    {job.location && (
                        <div className="text-xs text-muted-foreground mt-1 flex items-center">
                            <MapPin className="h-3.5 w-3.5 mr-1.5 text-muted-foreground shrink-0" />
                            {job.location}
                        </div>
                    )}
                  </div>
                  <div className="text-left sm:text-right mt-2 sm:mt-0 flex-shrink-0">
                     <Badge variant="secondary" className="text-sm flex items-center tabular-nums">
                        <Percent className="h-4 w-4 mr-1.5" />
                        {job.matchScore.toFixed(0)}% Match
                    </Badge>
                     <Progress value={job.matchScore} className="h-1.5 mt-1 w-24" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-foreground/90">{job.description}</p>
                {job.keyRequiredSkills && job.keyRequiredSkills.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center"><ListChecks className="h-4 w-4 mr-1.5"/>Key Skills:</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {job.keyRequiredSkills.map((skill, skillIndex) => (
                        <Badge key={skillIndex} variant="outline" className="text-xs px-2 py-0.5">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-start pt-4 border-t">
                <Button variant="default" size="sm" asChild>
                  <a href={job.applicationLink} target="_blank" rel="noopener noreferrer">
                    Apply Now <ExternalLink className="ml-1.5 h-4 w-4" />
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
           <p className="text-xs text-center text-muted-foreground pt-4">
            Note: These are AI-generated suggestions. Please verify job details on the respective platforms. Match Score indicates alignment with your resume.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
