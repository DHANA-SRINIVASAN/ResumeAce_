'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';

export default function SkillGapAnalysisPage() {
  const { toast } = useToast();
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [previousAnalyses, setPreviousAnalyses] = useState([]);

  // Fetch user's resumes on page load
  useEffect(() => {
    const fetchResumes = async () => {
      try {
        // In a real app, you would get the user ID from authentication
        const userId = 'sample-user-id';
        const response = await fetch(`/api/resumes?userId=${userId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch resumes');
        }

        const data = await response.json();
        setResumes(data);

        if (data.length > 0) {
          setSelectedResumeId(data[0].id);
          fetchPreviousAnalyses(data[0].id);
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      }
    };

    fetchResumes();
  }, [toast]);

  const fetchPreviousAnalyses = async (resumeId) => {
    try {
      const response = await fetch(`/api/skill-gap?resumeId=${resumeId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch previous analyses');
      }

      const data = await response.json();
      setPreviousAnalyses(data);
    } catch (error) {
      console.error('Error fetching previous analyses:', error);
    }
  };

  const handleResumeChange = (e) => {
    const resumeId = e.target.value;
    setSelectedResumeId(resumeId);
    fetchPreviousAnalyses(resumeId);
  };

  const analyzeSkillGap = async () => {
    if (!selectedResumeId) {
      toast({
        title: 'Error',
        description: 'Please select a resume',
        variant: 'destructive',
      });
      return;
    }

    if (!jobDescription.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a job description',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const response = await fetch('/api/skill-gap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeId: selectedResumeId,
          jobDescription,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze skill gap');
      }

      const data = await response.json();
      setAnalysisResult(data);

      // Refresh previous analyses
      fetchPreviousAnalyses(selectedResumeId);

      toast({
        title: 'Analysis complete',
        description: `Your resume has a ${data.matchPercentage}% match with the job description.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Skill Gap Analysis</h1>
      <p className="mb-6">
        Analyze how well your resume matches a job description and get recommendations for skills you need to develop.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>New Analysis</CardTitle>
              <CardDescription>
                Paste a job description to analyze how your resume matches the requirements.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="resume">Select Resume</Label>
                  <select
                    id="resume"
                    value={selectedResumeId}
                    onChange={handleResumeChange}
                    className="w-full p-2 border rounded-md"
                    disabled={isAnalyzing}
                  >
                    {resumes.map((resume) => (
                      <option key={resume.id} value={resume.id}>
                        {resume.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="jobDescription">Job Description</Label>
                  <Textarea
                    id="jobDescription"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={10}
                    placeholder="Paste the job description here..."
                    disabled={isAnalyzing}
                  />
                </div>

                <Button onClick={analyzeSkillGap} disabled={isAnalyzing || !selectedResumeId}>
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Skill Gap'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {analysisResult && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Analysis Results</CardTitle>
                <CardDescription>
                  Your resume has a {analysisResult.matchPercentage}% match with the job description.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Match Score</h3>
                    <Progress value={analysisResult.matchPercentage} className="h-2" />
                    <p className="text-sm text-muted-foreground mt-1">
                      {analysisResult.matchPercentage}% match with job requirements
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Your Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.userSkills.map((skill, index) => (
                        <div key={index} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                          {skill}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Required Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.requiredSkills.map((skill, index) => {
                        const isMissing = analysisResult.missingSkills.includes(skill);
                        return (
                          <div
                            key={index}
                            className={`${isMissing ? 'bg-destructive/10 text-destructive' : 'bg-green-100 text-green-800'
                              } px-3 py-1 rounded-full text-sm`}
                          >
                            {skill} {isMissing && '(Missing)'}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {analysisResult.missingSkills.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Skill Development Recommendations</h3>
                      <div className="space-y-4">
                        {analysisResult.recommendations.map((rec, index) => (
                          <div key={index} className="border p-4 rounded-lg">
                            <h4 className="font-medium">{rec.skill}</h4>
                            <div className="mt-2">
                              <h5 className="text-sm font-medium">Recommended Courses:</h5>
                              <ul className="mt-1 space-y-1">
                                {rec.courses.map((course, courseIndex) => (
                                  <li key={courseIndex} className="text-sm">
                                    <a href={course.url} className="text-blue-600 hover:underline">
                                      {course.title} ({course.platform})
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="mt-2">
                              <h5 className="text-sm font-medium">Additional Resources:</h5>
                              <ul className="mt-1 space-y-1">
                                {rec.resources.map((resource, resourceIndex) => (
                                  <li key={resourceIndex} className="text-sm">
                                    <a href={resource.url} className="text-blue-600 hover:underline">
                                      {resource.title} ({resource.type})
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Previous Analyses</CardTitle>
              <CardDescription>
                Your recent skill gap analyses for this resume.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {previousAnalyses.length > 0 ? (
                <div className="space-y-4">
                  {previousAnalyses.map((analysis) => (
                    <div key={analysis.id} className="border p-3 rounded-md">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{analysis.matchPercentage}% Match</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(analysis.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setAnalysisResult(analysis)}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  No previous analyses found for this resume.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Tips for Better Matches</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Tailor your resume to each job application</li>
                <li>• Use keywords from the job description</li>
                <li>• Quantify your achievements with metrics</li>
                <li>• Focus on relevant skills and experience</li>
                <li>• Keep your skills section up-to-date</li>
                <li>• Consider taking courses to fill skill gaps</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}