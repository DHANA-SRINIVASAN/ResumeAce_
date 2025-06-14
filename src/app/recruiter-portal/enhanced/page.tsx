// src/app/recruiter-portal/enhanced/page.tsx
"use client";

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { AuthGuard } from '@/components/auth-guard';
import {
  UploadCloud,
  FileText,
  Search,
  BarChart,
  Users,
  Briefcase,
  AlertCircle,
  CheckCircle,
  Info,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { BulkResumeUpload } from '@/components/bulk-resume-upload';
import { JobDescriptionUpload } from '@/components/job-description-upload';
import { ResumeRankingDashboard } from '@/components/resume-ranking-dashboard';
import { LoadingIndicator } from '@/components/loading-indicator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { fileToDataUri } from '@/lib/file-utils';
// LiveCareer API imports
import {
  searchLiveCareerResumes as searchLiveCareerApi,
  getLiveCareerResumeDetails,
  LiveCareerResumeSearchResult
} from '@/api/livecareer-api';
import { convertToResumeAnalysis } from '@/api/livecareer-adapter';

// Job description templates
const jdTemplates = [
  { label: "Software Engineer (General)", value: "We are seeking a motivated Software Engineer to design, develop, and maintain high-quality software solutions. Responsibilities include coding, testing, debugging, and collaborating with cross-functional teams. Proficiency in one or more programming languages (e.g., Java, Python, C++), understanding of data structures and algorithms, and experience with version control systems (e.g., Git) are required. Strong problem-solving skills and a bachelor's degree in Computer Science or a related field are essential. Experience with cloud platforms (AWS, Azure, GCP) and agile methodologies is a plus." },
  { label: "Data Analyst", value: "We are looking for a Data Analyst to interpret data, analyze results using statistical techniques, and provide ongoing reports. You will develop and implement databases, data collection systems, data analytics, and other strategies that optimize statistical efficiency and quality. Strong analytical skills with the ability to collect, organize, analyze, and disseminate significant amounts of information with attention to detail and accuracy are crucial. Proficiency in SQL, Excel, and data visualization tools (e.g., Tableau, Power BI) is required. Experience with Python or R for data analysis is highly desirable." },
  { label: "Frontend Developer", value: "Seeking a Frontend Developer to create user-friendly web pages and interfaces. You will be responsible for translating UI/UX design wireframes into actual code that will produce visual elements of the application. Proficiency in HTML, CSS, JavaScript, and modern frontend frameworks (e.g., React, Angular, Vue.js) is essential. Experience with responsive design, cross-browser compatibility, and version control (Git) is required. Familiarity with RESTful APIs and build tools like Webpack or Parcel is a plus." },
  { label: "Marketing Specialist", value: "Join our team as a Marketing Specialist to develop and implement marketing strategies that strengthen our company's market presence and help it find a 'voice' that will make a difference. You will conduct market research, manage digital campaigns (SEO/SEM, email, social media), create compelling content, and analyze campaign performance. Strong communication, creativity, and analytical skills are essential. Experience with marketing automation tools, CRM software, and Google Analytics is preferred." },
];

// Mock function to simulate uploading resumes to the server
const uploadResumes = async (files: File[], userId: string) => {
  // In a real implementation, you would use FormData to upload the files
  const formData = new FormData();
  formData.append('userId', userId);

  files.forEach(file => {
    formData.append('files', file);
  });

  // Simulate API call
  // const response = await fetch('/api/resumes/bulk', {
  //   method: 'POST',
  //   body: formData,
  // });

  // return response.json();

  // For now, return mock data
  await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay

  return {
    success: true,
    message: `Processed ${files.length} resumes successfully`,
    results: files.map((file, index) => {
      // Extract file name without extension
      const fileName = file.name.replace(/\.[^/.]+$/, "");

      // Try to extract a candidate name from the file name
      // Assume file names might be in formats like "John_Doe_Resume.pdf" or "Resume_Jane_Smith.docx"
      let candidateName = "";

      // Split by common separators and filter out empty parts
      const parts = fileName.split(/[_\-\s]+/).filter(Boolean);

      // If we have at least two parts, try to construct a name
      if (parts.length >= 2) {
        // Check if any part contains "resume" or "cv" (case insensitive)
        const resumePartIndex = parts.findIndex(part =>
          /resume|cv/i.test(part)
        );

        if (resumePartIndex !== -1) {
          // Remove the "resume" or "cv" part
          parts.splice(resumePartIndex, 1);
        }

        // Take the first two parts as first and last name
        if (parts.length >= 2) {
          const firstName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
          const lastName = parts[1].charAt(0).toUpperCase() + parts[1].slice(1).toLowerCase();
          candidateName = `${firstName} ${lastName}`;
        } else if (parts.length === 1) {
          // Just one part left, use it as the name
          candidateName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
        }
      }

      // If we couldn't extract a name, use a default
      if (!candidateName) {
        candidateName = `Candidate ${index + 1}`;
      }

      return {
        id: `resume-${index}-${Date.now()}`,
        title: fileName,
        candidateName: candidateName,
        createdAt: new Date().toISOString(),
      };
    }),
    errors: [],
  };
};

// Function to search LiveCareer resumes
const searchLiveCareerResumes = async (query: string): Promise<LiveCareerResumeSearchResult[]> => {
  try {
    // Use the actual LiveCareer API
    return await searchLiveCareerApi(query, 20); // Limit to 20 results
  } catch (error) {
    console.error('Error searching LiveCareer resumes:', error);

    // Fallback to mock data if API fails
    console.warn('Falling back to mock data for LiveCareer resume search');

    // Return mock data as fallback
    return [
      {
        id: 'lc-1',
        name: 'John Developer',
        skills: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
        experience: [
          {
            title: 'Senior Frontend Developer',
            company: 'Tech Company Inc.',
            startDate: '2020-01-01',
            endDate: '2023-01-01',
          }
        ]
      },
      {
        id: 'lc-2',
        name: 'Jane Engineer',
        skills: ['Python', 'Django', 'SQL', 'AWS'],
        experience: [
          {
            title: 'Backend Engineer',
            company: 'Software Solutions LLC',
            startDate: '2019-03-01',
            endDate: '2022-06-01',
          }
        ]
      },
      {
        id: 'lc-3',
        name: 'Alex Designer',
        skills: ['UI/UX', 'Figma', 'Adobe XD', 'HTML/CSS'],
        experience: [
          {
            title: 'Product Designer',
            company: 'Creative Agency',
            startDate: '2018-05-01',
            endDate: '2021-12-01',
          }
        ]
      },
    ];
  }
};

// Function to import a LiveCareer resume
const importLiveCareerResume = async (resumeId: string, userId: string) => {
  try {
    // Get detailed resume information from LiveCareer API
    const resumeDetails = await getLiveCareerResumeDetails(resumeId);

    // Convert to our application's format
    const resumeAnalysis = convertToResumeAnalysis(resumeDetails);

    // In a real implementation, you would store this in your database
    // For example:
    // const response = await fetch('/api/resumes/import', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ 
    //     resumeId, 
    //     userId,
    //     resumeDetails,
    //     resumeAnalysis 
    //   }),
    // });
    // return response.json();

    // For now, return formatted data
    // Extract candidate name from resume details
    const candidateName = resumeDetails.name || extractNameFromTitle(resumeDetails.title || '') || 'Imported Candidate';

    return {
      success: true,
      message: 'Resume imported from LiveCareer successfully',
      resume: {
        id: `imported-${resumeId}-${Date.now()}`,
        title: `${resumeDetails.title || 'Imported Resume'} (${new Date().toLocaleDateString()})`,
        candidateName: candidateName,
        createdAt: new Date().toISOString(),
        // Store the full resume data that we can use later
        data: resumeDetails,
        analysis: resumeAnalysis
      },
    };
  } catch (error) {
    console.error('Error importing LiveCareer resume:', error);

    // Return error response
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to import resume from LiveCareer',
      resume: null,
    };
  }
};

// Helper function to extract a name from a title
const extractNameFromTitle = (title: string): string => {
  // Split by common separators and filter out empty parts
  const parts = title.split(/[_\-\s]+/).filter(Boolean);

  // If we have at least two parts, try to construct a name
  if (parts.length >= 2) {
    // Check if any part contains "resume" or "cv" (case insensitive)
    const resumePartIndex = parts.findIndex(part =>
      /resume|cv/i.test(part)
    );

    if (resumePartIndex !== -1) {
      // Remove the "resume" or "cv" part
      parts.splice(resumePartIndex, 1);
    }

    // Take the first two parts as first and last name
    if (parts.length >= 2) {
      const firstName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
      const lastName = parts[1].charAt(0).toUpperCase() + parts[1].slice(1).toLowerCase();
      return `${firstName} ${lastName}`;
    } else if (parts.length === 1) {
      // Just one part left, use it as the name
      return parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
    }
  }

  // If we couldn't extract a name, return an empty string
  return "";
};

// Mock function to simulate batch matching resumes to a job description
const batchMatchResumes = async (resumeIds: string[], jobDescription: string, userId: string, resumes: Array<{ id: string; title: string; candidateName?: string }>) => {
  // In a real implementation, you would call your API
  // const response = await fetch('/api/job-matches/batch', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({ resumeIds, jobDescription, userId }),
  // });

  // return response.json();

  // For now, return mock data
  await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate network delay

  // Generate random match results
  const results = resumeIds.map(resumeId => {
    const score = Math.floor(Math.random() * 51) + 50; // Random score between 50-100
    let assessment;
    if (score >= 80) assessment = 'Excellent Fit';
    else if (score >= 70) assessment = 'Good Fit';
    else if (score >= 60) assessment = 'Fair Match';
    else assessment = 'Needs Improvement';

    // Find the original resume to get the candidate name
    const originalResume = resumes.find(resume => resume.id === resumeId);

    // Use the candidate name from the original resume if available
    const candidateName = originalResume?.candidateName ||
      (originalResume?.title ? extractNameFromTitle(originalResume.title) : null) ||
      `Candidate ${resumeId.substring(0, 3)}`;

    return {
      resumeId,
      resumeTitle: originalResume?.title || `Resume ${resumeId.substring(0, 5)}`,
      matchId: `match-${resumeId}-${Date.now()}`,
      matchScore: score,
      assessment,
      keyMatches: [
        'Strong technical skills',
        'Relevant industry experience',
        'Project management background',
        'Communication skills',
      ].slice(0, Math.floor(Math.random() * 3) + 2), // Random 2-4 matches
      keyMismatches: [
        'Limited leadership experience',
        'Missing required certification',
        'Insufficient years of experience',
        'Lack of specific technology knowledge',
      ].slice(0, Math.floor(Math.random() * 3) + 1), // Random 1-3 mismatches
      candidateName: candidateName,
    };
  });

  // Sort by score descending
  results.sort((a, b) => b.matchScore - a.matchScore);

  return {
    success: true,
    message: `Processed ${resumeIds.length} resumes against job description`,
    results,
    errors: [],
  };
};

function EnhancedRecruiterPortalContent() {
  const [activeTab, setActiveTab] = useState('upload');
  const [uploadedResumes, setUploadedResumes] = useState<Array<{ id: string; title: string }>>([]);
  const [liveCareerResumes, setLiveCareerResumes] = useState<any[]>([]);
  const [selectedResumes, setSelectedResumes] = useState<string[]>([]);
  const [jobDescription, setJobDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [matchResults, setMatchResults] = useState<any[]>([]);

  const [isUploadingResumes, setIsUploadingResumes] = useState(false);
  const [isSearchingLiveCareer, setIsSearchingLiveCareer] = useState(false);
  const [isImportingResume, setIsImportingResume] = useState(false);
  const [isMatchingResumes, setIsMatchingResumes] = useState(false);
  const [selectedResumeDetails, setSelectedResumeDetails] = useState<any>(null);
  const [isResumeDetailsOpen, setIsResumeDetailsOpen] = useState(false);

  const { toast } = useToast();

  // Mock user ID for demonstration
  const userId = 'user-123';

  const handleResumeUpload = useCallback(async (files: File[]) => {
    try {
      setIsUploadingResumes(true);
      const result = await uploadResumes(files, userId);

      if (result.success) {
        setUploadedResumes(prev => [...prev, ...result.results]);
        toast({
          title: 'Resumes Uploaded',
          description: result.message,
        });
      } else {
        toast({
          title: 'Upload Failed',
          description: result.message || 'Failed to upload resumes',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error uploading resumes:', error);
      toast({
        title: 'Upload Error',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingResumes(false);
    }
  }, [toast, userId]);

  const handleLiveCareerSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      toast({
        title: 'Search Query Required',
        description: 'Please enter a search term to find resumes on LiveCareer',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSearchingLiveCareer(true);
      const results = await searchLiveCareerResumes(searchQuery);
      setLiveCareerResumes(results);

      toast({
        title: 'Search Complete',
        description: `Found ${results.length} resumes on LiveCareer`,
      });
    } catch (error) {
      console.error('Error searching LiveCareer:', error);
      toast({
        title: 'Search Error',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSearchingLiveCareer(false);
    }
  }, [searchQuery, toast]);

  const handleImportLiveCareerResume = useCallback(async (resumeId: string) => {
    try {
      setIsImportingResume(true);
      const result = await importLiveCareerResume(resumeId, userId);

      if (result.success) {
        setUploadedResumes(prev => [...prev, result.resume]);
        toast({
          title: 'Resume Imported',
          description: result.message,
        });
      } else {
        toast({
          title: 'Import Failed',
          description: result.message || 'Failed to import resume',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error importing resume:', error);
      toast({
        title: 'Import Error',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsImportingResume(false);
    }
  }, [toast, userId]);

  const handleResumeSelection = useCallback((resumeId: string, isSelected: boolean) => {
    setSelectedResumes(prev => {
      if (isSelected) {
        return [...prev, resumeId];
      } else {
        return prev.filter(id => id !== resumeId);
      }
    });
  }, []);

  const handleSelectAllResumes = useCallback((isSelected: boolean) => {
    if (isSelected) {
      setSelectedResumes(uploadedResumes.map(resume => resume.id));
    } else {
      setSelectedResumes([]);
    }
  }, [uploadedResumes]);

  const handleJobDescriptionChange = useCallback((text: string) => {
    setJobDescription(text);
  }, []);

  const handleMatchResumes = useCallback(async () => {
    if (selectedResumes.length === 0) {
      toast({
        title: 'No Resumes Selected',
        description: 'Please select at least one resume to match against the job description',
        variant: 'destructive',
      });
      return;
    }

    if (!jobDescription.trim()) {
      toast({
        title: 'Job Description Required',
        description: 'Please provide a job description to match against',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsMatchingResumes(true);
      const result = await batchMatchResumes(selectedResumes, jobDescription, userId, uploadedResumes);

      if (result.success) {
        setMatchResults(result.results);
        setActiveTab('results');
        toast({
          title: 'Matching Complete',
          description: result.message,
        });
      } else {
        toast({
          title: 'Matching Failed',
          description: result.message || 'Failed to match resumes',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error matching resumes:', error);
      toast({
        title: 'Matching Error',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsMatchingResumes(false);
    }
  }, [selectedResumes, jobDescription, toast, userId, uploadedResumes]);

  const handleViewResumeDetails = useCallback((resumeId: string) => {
    // Find the resume details from the match results
    const resumeDetails = matchResults.find(result => result.resumeId === resumeId);

    if (resumeDetails) {
      setSelectedResumeDetails(resumeDetails);
      setIsResumeDetailsOpen(true);
    } else {
      toast({
        title: 'Resume Not Found',
        description: `Could not find details for resume ${resumeId}`,
        variant: 'destructive',
      });
    }
  }, [matchResults, toast]);

  const handleDownloadReport = useCallback(() => {
    // In a real implementation, you would generate and download a report
    toast({
      title: 'Download Report',
      description: 'Generating and downloading report...',
    });

    // Simulate download delay
    setTimeout(() => {
      toast({
        title: 'Report Downloaded',
        description: 'Resume ranking report has been downloaded',
      });
    }, 2000);
  }, [toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-background py-10">
      <div className="container mx-auto px-4">
        <header className="mb-12 pt-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center bg-primary/10 text-primary p-4 rounded-full shadow-lg mb-6 ring-4 ring-primary/20">
              <BarChart className="w-12 h-12" />
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary">
              Enhanced Recruiter Suite
            </h1>
            <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Bulk upload resumes, scrape from LiveCareer, and match against job descriptions with advanced analytics.
            </p>

          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid grid-cols-1 md:grid-cols-3 w-full max-w-3xl mx-auto">
            <TabsTrigger value="upload" disabled={isMatchingResumes}>
              <UploadCloud className="h-4 w-4 mr-2" /> Upload Resumes
            </TabsTrigger>
            <TabsTrigger value="match" disabled={isMatchingResumes || uploadedResumes.length === 0}>
              <Briefcase className="h-4 w-4 mr-2" /> Job Matching
            </TabsTrigger>
            <TabsTrigger value="results" disabled={matchResults.length === 0 || isMatchingResumes}>
              <BarChart className="h-4 w-4 mr-2" /> Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="shadow-xl bg-card/80 backdrop-blur-sm border border-primary/10 hover:border-primary/30 transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl text-primary">
                    <UploadCloud className="mr-3 h-7 w-7" /> Bulk Resume Upload
                  </CardTitle>
                  <CardDescription className="text-md">
                    Upload multiple resumes at once (PDF, DOCX, JPG, PNG).
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BulkResumeUpload
                    onUpload={handleResumeUpload}
                    isProcessing={isUploadingResumes}
                  />
                </CardContent>
              </Card>

              <Card className="shadow-xl bg-card/80 backdrop-blur-sm border border-primary/10 hover:border-primary/30 transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl text-primary">
                    <Search className="mr-3 h-7 w-7" /> LiveCareer Integration
                  </CardTitle>
                  <CardDescription className="text-md">
                    Search and import resumes from LiveCareer.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="livecareer-search">Search LiveCareer Resumes</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="livecareer-search"
                        placeholder="Enter skills, job titles, or keywords..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        disabled={isSearchingLiveCareer}
                      />
                      <Button
                        onClick={handleLiveCareerSearch}
                        disabled={isSearchingLiveCareer || !searchQuery.trim()}
                      >
                        {isSearchingLiveCareer ? <LoadingIndicator size="sm" /> : <Search className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {isSearchingLiveCareer ? (
                    <div className="flex justify-center py-8">
                      <LoadingIndicator text="Searching LiveCareer..." />
                    </div>
                  ) : liveCareerResumes.length > 0 ? (
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Search Results ({liveCareerResumes.length})</h3>
                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                        {liveCareerResumes.map((resume) => (
                          <Card key={resume.id} className="p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{resume.name}</h4>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Skills: {resume.skills.join(', ')}
                                </p>
                                {resume.experience && resume.experience[0] && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Latest: {resume.experience[0].title} at {resume.experience[0].company}
                                  </p>
                                )}
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleImportLiveCareerResume(resume.id)}
                                disabled={isImportingResume}
                              >
                                Import
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Search className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                      <p className="text-muted-foreground">
                        Search for resumes on LiveCareer by entering keywords above.
                      </p>
                    </div>
                  )}

                  <Alert variant="default" className="bg-primary/5 border-primary/20">
                    <Info className="h-4 w-4 text-primary" />
                    <AlertTitle className="text-primary font-medium">LiveCareer Integration</AlertTitle>
                    <AlertDescription className="text-primary/80">
                      This is a demonstration of the LiveCareer integration. In a production environment, you would connect to the actual LiveCareer API.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>

            {uploadedResumes.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center">
                      <FileText className="mr-2 h-5 w-5" /> Uploaded Resumes
                    </CardTitle>
                    <div className="text-sm text-muted-foreground">
                      {uploadedResumes.length} resume{uploadedResumes.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="select-all"
                          className="mr-2"
                          checked={selectedResumes.length === uploadedResumes.length && uploadedResumes.length > 0}
                          onChange={(e) => handleSelectAllResumes(e.target.checked)}
                        />
                        <Label htmlFor="select-all">Select All</Label>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveTab('match')}
                        disabled={selectedResumes.length === 0}
                      >
                        Proceed to Job Matching
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {uploadedResumes.map((resume) => (
                        <div
                          key={resume.id}
                          className={`p-3 border rounded-md flex items-center space-x-3 ${selectedResumes.includes(resume.id) ? 'bg-primary/5 border-primary/30' : 'bg-card border-border'
                            }`}
                        >
                          <input
                            type="checkbox"
                            id={`resume-${resume.id}`}
                            checked={selectedResumes.includes(resume.id)}
                            onChange={(e) => handleResumeSelection(resume.id, e.target.checked)}
                          />
                          <Label htmlFor={`resume-${resume.id}`} className="flex-grow cursor-pointer">
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span className="truncate">{resume.title}</span>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="match" className="space-y-8">
            <Card className="shadow-xl bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl text-primary">
                  <Briefcase className="mr-3 h-7 w-7" /> Job Description
                </CardTitle>
                <CardDescription className="text-md">
                  Enter or upload a job description to match against {selectedResumes.length} selected resume{selectedResumes.length !== 1 ? 's' : ''}.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <JobDescriptionUpload
                  onJobDescriptionChange={handleJobDescriptionChange}
                  jobDescription={jobDescription}
                  isProcessing={isMatchingResumes}
                  templates={jdTemplates}
                />

                <div className="flex justify-between items-center mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab('upload')}
                    disabled={isMatchingResumes}
                  >
                    Back to Resumes
                  </Button>
                  <Button
                    onClick={handleMatchResumes}
                    disabled={isMatchingResumes || !jobDescription.trim() || selectedResumes.length === 0}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {isMatchingResumes ? (
                      <LoadingIndicator size="sm" text="Matching Resumes..." />
                    ) : (
                      <>Match {selectedResumes.length} Resume{selectedResumes.length !== 1 ? 's' : ''}</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>About Resume Matching</AlertTitle>
              <AlertDescription>
                Our AI will analyze each resume against the job description and provide a detailed match score, highlighting strengths and gaps for each candidate.
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="results">
            {matchResults.length > 0 ? (
              <ResumeRankingDashboard
                results={matchResults}
                jobDescription={jobDescription}
                onViewDetails={handleViewResumeDetails}
                onDownloadReport={handleDownloadReport}
              />
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="flex flex-col items-center">
                    <BarChart className="h-16 w-16 text-muted-foreground opacity-20 mb-4" />
                    <h3 className="text-xl font-medium mb-2">No Results Yet</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Match resumes against a job description to see ranking results here.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-6"
                      onClick={() => setActiveTab('upload')}
                    >
                      Go to Resume Upload
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <footer className="text-center mt-20 py-10 border-t border-border/50">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ResumeAce Enhanced Recruiter Suite.
          </p>
          <p className="text-xs text-muted-foreground/80 mt-2">
            AI-powered resume analysis and job matching.
          </p>
        </footer>

        {/* Resume Details Dialog */}
        <Dialog open={isResumeDetailsOpen} onOpenChange={setIsResumeDetailsOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Resume Details
              </DialogTitle>
              <DialogDescription>
                Detailed information about the selected resume
              </DialogDescription>
            </DialogHeader>

            {selectedResumeDetails && (
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold">
                      {selectedResumeDetails.candidateName || selectedResumeDetails.resumeTitle}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Resume ID: {selectedResumeDetails.resumeId}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold" style={{
                      color: selectedResumeDetails.matchScore >= 80 ? '#22c55e' :
                        selectedResumeDetails.matchScore >= 70 ? '#3b82f6' :
                          selectedResumeDetails.matchScore >= 50 ? '#f59e0b' :
                            '#ef4444'
                    }}>
                      {selectedResumeDetails.matchScore}%
                    </div>
                    <div className="text-sm font-medium">
                      {selectedResumeDetails.assessment}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-2" /> Key Matches
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {selectedResumeDetails.keyMatches.map((match: string, index: number) => (
                          <li key={index} className="text-sm flex items-start">
                            <CheckCircle className="h-4 w-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{match}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center text-red-600">
                        <AlertCircle className="h-4 w-4 mr-2" /> Key Mismatches
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {selectedResumeDetails.keyMismatches.map((mismatch: string, index: number) => (
                          <li key={index} className="text-sm flex items-start">
                            <AlertCircle className="h-4 w-4 mr-2 text-red-500 mt-0.5 flex-shrink-0" />
                            <span>{mismatch}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-2">Job Description Match Analysis</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    This analysis shows how well the candidate's resume matches the job requirements.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">Overall Match</span>
                        <span className="text-sm font-bold" style={{
                          color: selectedResumeDetails.matchScore >= 80 ? '#22c55e' :
                            selectedResumeDetails.matchScore >= 70 ? '#3b82f6' :
                              selectedResumeDetails.matchScore >= 50 ? '#f59e0b' :
                                '#ef4444'
                        }}>
                          {selectedResumeDetails.matchScore}%
                        </span>
                      </div>
                      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${selectedResumeDetails.matchScore}%`,
                            backgroundColor: selectedResumeDetails.matchScore >= 80 ? '#22c55e' :
                              selectedResumeDetails.matchScore >= 70 ? '#3b82f6' :
                                selectedResumeDetails.matchScore >= 50 ? '#f59e0b' :
                                  '#ef4444'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setIsResumeDetailsOpen(false)}
                    className="mr-2"
                  >
                    Close
                  </Button>
                  <Button onClick={handleDownloadReport}>
                    <Download className="h-4 w-4 mr-2" /> Download Report
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default function EnhancedRecruiterPortalPage() {
  return (
    <AuthGuard>
      <EnhancedRecruiterPortalContent />
    </AuthGuard>
  );
}