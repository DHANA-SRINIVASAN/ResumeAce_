// src/components/analysis-results-display.tsx
"use client";

import type { AnalyzeResumeOutput } from '@/ai/flows/resume-analyzer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, Briefcase, GraduationCap, Lightbulb, CheckSquare, ExternalLink, Asterisk, Download, FileCode } from 'lucide-react';
import { Separator } from './ui/separator';
import { Button } from '@/components/ui/button';
import { exportAnalysisToCsv } from '@/lib/csv-utils';
import { generatePortfolioHtml, type PortfolioGeneratorOutput } from '@/ai/flows/portfolio-generator-flow';
import { downloadHtml } from '@/lib/download-utils'; // New utility for HTML download
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { LoadingIndicator } from './loading-indicator';


interface AnalysisResultsDisplayProps {
  analysis: AnalyzeResumeOutput;
}

const SectionCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; description?: string }> = ({ title, icon, children, description }) => (
  <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
    <CardHeader className="flex flex-row items-center space-x-3 pb-3">
      <span className="p-2 bg-primary/10 rounded-md text-primary">{icon}</span>
      <div>
        <CardTitle className="text-xl font-semibold text-primary">{title}</CardTitle>
        {description && <CardDescription className="text-sm">{description}</CardDescription>}
      </div>
    </CardHeader>
    <CardContent className="text-sm text-foreground/90">
      {children}
    </CardContent>
  </Card>
);


export function AnalysisResultsDisplay({ analysis }: AnalysisResultsDisplayProps) {
  const { name, contactDetails, skills, education, experience, projects } = analysis;
  const [isGeneratingPortfolio, setIsGeneratingPortfolio] = useState(false);
  const { toast } = useToast();

  const handleDownloadCsv = () => {
    const safeName = (name || 'resume').replace(/[^a-z0-9_]+/gi, '_').toLowerCase();
    exportAnalysisToCsv(analysis, `${safeName}_analysis.csv`);
  };

  const handleDownloadPortfolio = async () => {
    setIsGeneratingPortfolio(true);
    try {
      const portfolioInput = {
        name: analysis.name || "Your Name",
        contactDetails: analysis.contactDetails || "your.email@example.com",
        skills: analysis.skills || [],
        education: analysis.education || "Your Education",
        experience: analysis.experience || "Your Experience",
        projects: analysis.projects || [],
      };
      const portfolioOutput: PortfolioGeneratorOutput = await generatePortfolioHtml(portfolioInput);
      downloadHtml(portfolioOutput.htmlContent, portfolioOutput.suggestedFilename);
      toast({
        title: "Portfolio Generated",
        description: `${portfolioOutput.suggestedFilename} has been downloaded.`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error generating portfolio:", error);
      toast({
        title: "Portfolio Generation Failed",
        description: error instanceof Error ? error.message : "Could not generate portfolio HTML.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPortfolio(false);
    }
  };


  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-primary border-2">
        <CardHeader className="text-center">
          <div className="inline-block p-3 bg-primary/10 rounded-full mx-auto mb-2">
             <User className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">{name || 'N/A'}</CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            {contactDetails || 'No contact details found'}
            {analysis.language && <span className="block mt-1 text-xs">(Resume Language: {analysis.language})</span>}
          </CardDescription>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button 
              onClick={handleDownloadCsv}
              variant="outline"
              size="sm"
              className="shadow-sm hover:shadow-md transition-shadow"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Analysis (CSV)
            </Button>
            <Button 
              onClick={handleDownloadPortfolio}
              variant="outline"
              size="sm"
              className="shadow-sm hover:shadow-md transition-shadow"
              disabled={isGeneratingPortfolio}
            >
              {isGeneratingPortfolio ? (
                <LoadingIndicator size="sm" text="Generating..." />
              ) : (
                <>
                  <FileCode className="mr-2 h-4 w-4" />
                  Download Portfolio (HTML)
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SectionCard title="Skills" icon={<CheckSquare className="w-6 h-6" />} description="Key abilities and proficiencies">
          {skills && skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <Badge key={index} variant="default" className="bg-primary/80 hover:bg-primary text-primary-foreground text-sm px-3 py-1 rounded-full shadow">
                  {skill}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No skills extracted.</p>
          )}
        </SectionCard>

        <SectionCard title="Education" icon={<GraduationCap className="w-6 h-6" />} description="Academic background and qualifications">
          <p className="whitespace-pre-wrap">{education || 'No education details extracted.'}</p>
        </SectionCard>
      </div>

      <SectionCard title="Experience" icon={<Briefcase className="w-6 h-6" />} description="Professional work history">
         <p className="whitespace-pre-wrap">{experience || 'No experience details extracted.'}</p>
      </SectionCard>

      {projects && projects.length > 0 && (
        <SectionCard title="Projects" icon={<Lightbulb className="w-6 h-6" />} description="Noteworthy projects undertaken">
            <ul className="space-y-2">
                {projects.map((project, index) => (
                    <li key={index} className="flex items-start space-x-2">
                        <Asterisk className="w-4 h-4 text-primary mt-1 shrink-0" />
                        <span>{project}</span>
                    </li>
                ))}
            </ul>
        </SectionCard>
      )}
    </div>
  );
}
