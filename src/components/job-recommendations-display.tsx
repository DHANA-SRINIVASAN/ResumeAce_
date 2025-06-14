// src/components/job-recommendations-display.tsx
"use client";

import type { JobRecommenderOutput, RecommendedJob } from '@/ai/flows/job-recommender';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, Building, ExternalLink, Target, MapPin, Percent, ListChecks, Layers, Search } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import Image from 'next/image';
import { useState, useEffect } from 'react';

interface JobRecommendationsDisplayProps {
  recommendations: JobRecommenderOutput & {
    resumeScoreBelow30?: boolean;
  };
}

// Helper function to get platform logo
const getPlatformLogo = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'linkedin':
      return 'https://cdn-icons-png.flaticon.com/512/174/174857.png';
    case 'naukri':
      return 'https://static.naukimg.com/s/4/100/i/naukri_Logo.png';
    case 'indeed':
      return 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Indeed_logo.svg/2560px-Indeed_logo.svg.png';
    case 'glassdoor':
      return 'https://upload.wikimedia.org/wikipedia/commons/e/e1/Glassdoor_logo.svg';
    case 'simplyhired':
      return 'https://www.simplyhired.com/static/images/shared/sh-logo-green.svg';
    default:
      return null;
  }
};

export function JobRecommendationsDisplay({ recommendations }: JobRecommendationsDisplayProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [filteredJobs, setFilteredJobs] = useState<RecommendedJob[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading for better UX
    const timer = setTimeout(() => {
      setIsLoading(false);
      setFilteredJobs(
        recommendations.jobs.filter(job => job.platform.toLowerCase() !== 'naukri')
      );
    }, 1000);

    return () => clearTimeout(timer);
  }, [recommendations]);

  // Filter jobs by platform
  const filterByPlatform = (platform: string | null) => {
    setSelectedPlatform(platform);
    if (platform === null) {
      setFilteredJobs(
        recommendations.jobs.filter(job => job.platform.toLowerCase() !== 'naukri')
      );
    } else {
      setFilteredJobs(
        recommendations.jobs.filter(
          job =>
            job.platform.toLowerCase() === platform.toLowerCase() &&
            job.platform.toLowerCase() !== 'naukri'
        )
      );
    }
  };

  // Get unique platforms (excluding Naukri)
  const platforms = recommendations.jobs
    ? [...new Set(recommendations.jobs
        .filter(job => job.platform.toLowerCase() !== 'naukri')
        .map(job => job.platform))]
    : [];

  if (isLoading) {
    return (
      <Card className="shadow-xl border-accent border-t-4">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <span className="p-2 bg-accent/10 rounded-md text-accent">
              <Target className="w-7 h-7" />
            </span>
            <div>
              <CardTitle className="text-2xl font-bold text-accent">Job Matches</CardTitle>
              <CardDescription>Searching for job opportunities across multiple platforms...</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground text-center">Fetching real job listings from LinkedIn, Naukri, Indeed, Glassdoor, and SimplyHired...</p>
        </CardContent>
      </Card>
    );
  }

  if (!recommendations || !recommendations.jobs || recommendations.jobs.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-primary flex items-center">
            <Briefcase className="mr-2 h-5 w-5" />
            Job Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No job recommendations available at this time. Try adjusting your resume or criteria. Ensure your resume includes relevant skills and your resume score is 30 or above.</p>
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
            <h3 className="text-sm font-medium text-amber-800 mb-2">Troubleshooting Tips:</h3>
            <ul className="text-sm text-amber-700 list-disc pl-5 space-y-1">
              <li>Make sure your resume includes specific skills (e.g., JavaScript, React, Python)</li>
              <li>Add more details to your work experience</li>
              <li>Include a target role if you have one in mind</li>
              <li>Try refreshing the page or submitting your resume again</li>
            </ul>
          </div>
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
              <CardTitle className="text-2xl font-bold text-accent">Real Job Matches</CardTitle>
              <CardDescription>Based on your resume, here are real job opportunities from top job portals. Filter by platform to see specific results.</CardDescription>
            </div>
          </div>

          {/* Platform filter buttons */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              variant={selectedPlatform === null ? "default" : "outline"}
              size="sm"
              onClick={() => filterByPlatform(null)}
              className="flex items-center gap-1.5"
            >
              <Search className="h-3.5 w-3.5" />
              All Platforms
            </Button>

            {platforms.map(platform => (
              <Button
                key={platform}
                variant={selectedPlatform === platform ? "default" : "outline"}
                size="sm"
                onClick={() => filterByPlatform(platform)}
                className="flex items-center gap-1.5"
              >
                {getPlatformLogo(platform) ? (
                  <div className="relative h-3.5 w-3.5 mr-1">
                    <Image
                      src={getPlatformLogo(platform) || ''}
                      alt={platform}
                      width={14}
                      height={14}
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <Layers className="h-3.5 w-3.5" />
                )}
                {platform}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No jobs found for the selected platform. Try another platform or view all jobs.</p>
            </div>
          ) : (
            filteredJobs.map((job, index) => (
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
                      {job.platform && (
                        <div className="text-xs text-muted-foreground mt-1 flex items-center">
                          {getPlatformLogo(job.platform) ? (
                            <div className="relative h-3.5 w-3.5 mr-1.5">
                              <Image
                                src={getPlatformLogo(job.platform) || ''}
                                alt={job.platform}
                                width={14}
                                height={14}
                                className="object-contain"
                              />
                            </div>
                          ) : (
                            <Layers className="h-3.5 w-3.5 mr-1.5 text-muted-foreground shrink-0" />
                          )}
                          Source: {job.platform}
                        </div>
                      )}
                    </div>
                    <div className="text-left sm:text-right mt-2 sm:mt-0 flex-shrink-0">
                      <Badge
                        variant={job.matchScore >= 80 ? "default" : job.matchScore >= 60 ? "secondary" : "outline"}
                        className={`text-sm flex items-center tabular-nums ${job.matchScore >= 80 ? "bg-green-500 text-white" : ""}`}
                      >
                        <Percent className="h-4 w-4 mr-1.5" />
                        {job.matchScore.toFixed(0)}% Match
                      </Badge>
                      <Progress
                        value={job.matchScore}
                        className={`h-1.5 mt-1 w-24 ${job.matchScore >= 80 ? "bg-green-200" :
                          job.matchScore >= 60 ? "bg-blue-200" :
                            "bg-gray-200"
                          }`}
                      />
                      <div className="text-xs text-muted-foreground mt-1">
                        AI-analyzed match
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-foreground/90">{job.description}</p>
                  {job.keyRequiredSkills && job.keyRequiredSkills.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center"><ListChecks className="h-4 w-4 mr-1.5" />Key Skills:</h4>
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
            ))
          )}
          <p className="text-xs text-center text-muted-foreground pt-4">
            Note: These job listings are fetched from various job portals. Please verify job details on the respective platforms before applying. Match Score indicates alignment with your resume.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

