// src/components/job-recommendations-display.tsx
"use client";

import type { JobRecommenderOutput, RecommendedJob } from '@/ai/flows/job-recommender';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, Building, ExternalLink, LinkIcon, Percent, Search, Target, MapPin } from 'lucide-react';
import {Progress} from "@/components/ui/progress";

interface JobRecommendationsDisplayProps {
  recommendations: JobRecommenderOutput;
}

const PlatformLink: React.FC<{ platformName: string; url?: string }> = ({ platformName, url }) => {
  if (!url) return null;
  // A simple way to infer the platform for icon/styling, can be more robust
  let Icon = LinkIcon;
  if (platformName.toLowerCase().includes('linkedin')) Icon = LinkedinIcon;
  else if (platformName.toLowerCase().includes('naukri')) Icon = Briefcase; // Using Briefcase as a generic job icon
  else if (platformName.toLowerCase().includes('indeed')) Icon = Search;
  else if (platformName.toLowerCase().includes('glassdoor')) Icon = Building;


  return (
    <Button variant="outline" size="sm" asChild className="text-xs">
      <a href={url} target="_blank" rel="noopener noreferrer">
        <Icon className="mr-1.5 h-3.5 w-3.5" />
        {platformName}
      </a>
    </Button>
  );
};

// Placeholder for LinkedIn Icon if not directly available or to standardize
const LinkedinIcon = (props: React.ComponentProps<typeof LinkIcon>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect width="4" height="12" x="2" y="9"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);


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
              <CardDescription>Based on your resume, here are some potential job opportunities. Locations prioritized for India (Chennai, Bangalore, Hyderabad, Coimbatore, Trichy).</CardDescription>
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
                    <CardDescription className="text-base text-muted-foreground">{job.company}</CardDescription>
                    {job.location && (
                        <div className="text-xs text-muted-foreground mt-1 flex items-center">
                            <MapPin className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                            {job.location}
                        </div>
                    )}
                  </div>
                  <div className="text-left sm:text-right mt-2 sm:mt-0 flex-shrink-0">
                     <Badge variant="secondary" className="text-sm flex items-center">
                        <Percent className="h-4 w-4 mr-1.5" />
                        {(job.relevanceScore * 100).toFixed(0)}% Match
                    </Badge>
                     <Progress value={job.relevanceScore * 100} className="h-1.5 mt-1 w-24" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/90 mb-4">{job.description}</p>
              </CardContent>
              <CardFooter className="flex flex-wrap gap-2 justify-start pt-4 border-t">
                <PlatformLink platformName="LinkedIn" url={job.suggestedSearchLinks.linkedIn} />
                <PlatformLink platformName="Naukri" url={job.suggestedSearchLinks.naukri} />
                <PlatformLink platformName="Indeed" url={job.suggestedSearchLinks.indeed} />
                <PlatformLink platformName="Glassdoor" url={job.suggestedSearchLinks.glassdoor} />
              </CardFooter>
            </Card>
          ))}
           <p className="text-xs text-center text-muted-foreground pt-4">
            Note: These are AI-generated suggestions. Please verify job details on the respective platforms. Relevance score indicates match to resume.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

