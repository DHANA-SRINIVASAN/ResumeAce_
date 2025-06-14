'use client';

import { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, Button, CircularProgress, Alert } from '@mui/material';
import ResumeAnalysisResults from '@/components/resume-analysis-results';

export default function ResumeAnalysisPage({ params }: { params: { id: string } }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // In a real app, you'd get this from your auth context
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);
  
  const handleRequestAnalysis = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // This would be a real API call to analyze the resume
      // For now, we'll simulate it with a mock response
      
      const mockExtractedData = {
        contact: {
          name: "John Doe",
          email: "john.doe@example.com",
          phone: "555-123-4567",
          location: "New York, NY"
        },
        summary: "Experienced software engineer with 5+ years of experience in web development.",
        skills: ["JavaScript", "React", "Node.js", "TypeScript", "HTML", "CSS"],
        experience: [
          {
            title: "Senior Software Engineer",
            company: "Tech Company",
            location: "New York, NY",
            startDate: "2020-01",
            endDate: "Present",
            description: "Led development of web applications using React and Node.js."
          },
          {
            title: "Software Engineer",
            company: "Another Tech Company",
            location: "Boston, MA",
            startDate: "2018-03",
            endDate: "2019-12",
            description: "Developed and maintained web applications."
          }
        ],
        education: [
          {
            degree: "Bachelor of Science in Computer Science",
            institution: "University of Technology",
            location: "Boston, MA",
            graduationDate: "2018-05"
          }
        ]
      };
      
      const mockAnalysis = {
        extractedData: mockExtractedData,
        skills: ["JavaScript", "React", "Node.js", "TypeScript", "HTML", "CSS"],
        experience: mockExtractedData.experience,
        education: mockExtractedData.education,
        missingElements: ["Achievements", "Projects", "Certifications"],
        improvementSuggestions: {
          summary: "Add more specific achievements and metrics to your summary.",
          experience: [
            "Include quantifiable achievements in your work experience.",
            "Add more details about technologies used in each role."
          ],
          skills: "Consider organizing skills by proficiency level."
        },
        atsScore: 75,
        atsIssues: {
          issues: [
            "Resume contains some complex formatting that may not parse well in ATS systems.",
            "Consider using more standard section headings."
          ]
        },
        jobRecommendations: {
          jobs: [
            {
              title: "Senior Frontend Developer",
              company: "Example Corp",
              location: "New York, NY",
              matchScore: 85,
              keySkills: ["React", "TypeScript", "JavaScript"],
              url: "https://example.com/job1"
            },
            {
              title: "Full Stack Engineer",
              company: "Tech Startup",
              location: "Remote",
              matchScore: 78,
              keySkills: ["React", "Node.js", "JavaScript"],
              url: "https://example.com/job2"
            }
          ]
        },
        careerPathOptions: {
          paths: [
            {
              title: "Engineering Manager",
              description: "Lead a team of engineers in developing software products.",
              requiredSkills: ["Leadership", "Communication", "JavaScript", "React"],
              growthPotential: "High demand with 15% growth expected over next 5 years"
            },
            {
              title: "Senior Frontend Architect",
              description: "Design and implement frontend architecture for complex applications.",
              requiredSkills: ["React", "TypeScript", "System Design", "Performance Optimization"],
              growthPotential: "Specialized role with competitive compensation"
            }
          ]
        },
        skillGaps: {
          missingSkills: ["GraphQL", "AWS", "Docker"],
          recommendations: {
            "GraphQL": "Increasingly popular for API development",
            "AWS": "Cloud skills are in high demand",
            "Docker": "Container knowledge is expected for many senior roles"
          }
        }
      };
      
      // In a real app, you'd make an API call to analyze the resume
      // For now, we'll simulate it with a timeout
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Then save the analysis results
      const response = await fetch('/api/resume/analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          resumeId: params.id,
          ...mockAnalysis
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save analysis results');
      }
      
      // Refresh the page to show the new analysis
      window.location.reload();
    } catch (err) {
      console.error(err);
      setError('Failed to analyze resume');
    } finally {
      setLoading(false);
    }
  };
  
  if (!userId) {
    return (
      <Container maxWidth="lg">
        <Box py={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography>
              Please log in to view resume analysis.
            </Typography>
          </Paper>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Resume Analysis
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Get insights and recommendations to improve your resume and find better job matches.
          </Typography>
        </Paper>
        
        {loading ? (
          <Box display="flex" flexDirection="column" alignItems="center" p={4}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography>Analyzing your resume...</Typography>
          </Box>
        ) : (
          <>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            <ResumeAnalysisResults 
              userId={userId} 
              resumeId={params.id} 
              onRequestAnalysis={handleRequestAnalysis} 
            />
          </>
        )}
      </Box>
    </Container>
  );
}