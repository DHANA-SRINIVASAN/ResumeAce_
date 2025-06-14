'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Chip, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon, 
  Divider, 
  CircularProgress, 
  Alert, 
  Button,
  Card,
  CardContent,
  CardHeader,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { 
  CheckCircle, 
  Error, 
  Warning, 
  Info, 
  School, 
  Work, 
  Star, 
  ExpandMore,
  TrendingUp,
  Construction,
  Lightbulb
} from '@mui/icons-material';

type ResumeAnalysisProps = {
  userId: string;
  resumeId: string;
  onRequestAnalysis?: () => void;
};

type ResumeAnalysis = {
  id: string;
  userId: string;
  resumeId: string;
  extractedData: any;
  skills: string[];
  experience: any[];
  education: any[];
  missingElements: string[];
  improvementSuggestions?: any;
  atsScore?: number;
  atsIssues?: any;
  jobRecommendations?: any;
  careerPathOptions?: any;
  skillGaps?: any;
  createdAt: string;
  updatedAt: string;
};

export default function ResumeAnalysisResults({ 
  userId, 
  resumeId,
  onRequestAnalysis 
}: ResumeAnalysisProps) {
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchAnalysis() {
      try {
        const response = await fetch(`/api/resume/analysis?userId=${userId}&resumeId=${resumeId}`);
        
        if (response.status === 404) {
          // No analysis yet
          setAnalysis(null);
          setLoading(false);
          return;
        }
        
        if (!response.ok) {
          throw new Error('Failed to fetch resume analysis');
        }
        
        const data = await response.json();
        setAnalysis(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load resume analysis');
      } finally {
        setLoading(false);
      }
    }
    
    if (userId && resumeId) {
      fetchAnalysis();
    }
  }, [userId, resumeId]);
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }
  
  if (!analysis) {
    return (
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          No Analysis Available
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Your resume hasn't been analyzed yet. Request an analysis to get insights and recommendations.
        </Typography>
        {onRequestAnalysis && (
          <Button 
            variant="contained" 
            onClick={onRequestAnalysis}
            sx={{ mt: 2 }}
          >
            Analyze Resume
          </Button>
        )}
      </Paper>
    );
  }
  
  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Resume Analysis Results
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        Last updated: {new Date(analysis.updatedAt).toLocaleString()}
      </Typography>
      
      {/* ATS Score */}
      {analysis.atsScore !== undefined && (
        <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            ATS Compatibility Score
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box sx={{ position: 'relative', display: 'inline-flex', mr: 2 }}>
              <CircularProgress
                variant="determinate"
                value={analysis.atsScore}
                size={80}
                thickness={4}
                color={analysis.atsScore > 70 ? 'success' : analysis.atsScore > 40 ? 'warning' : 'error'}
              />
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="h6" component="div" color="text.secondary">
                  {analysis.atsScore}%
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body1">
                {analysis.atsScore > 70 
                  ? 'Your resume is well-optimized for ATS systems.' 
                  : analysis.atsScore > 40 
                  ? 'Your resume needs some improvements for better ATS compatibility.' 
                  : 'Your resume needs significant improvements for ATS systems.'}
              </Typography>
            </Box>
          </Box>
          
          {analysis.atsIssues && analysis.atsIssues.issues && analysis.atsIssues.issues.length > 0 && (
            <Box mt={2}>
              <Typography variant="subtitle2" gutterBottom>
                Issues to Address:
              </Typography>
              <List dense>
                {analysis.atsIssues.issues.map((issue: string, index: number) => (
                  <ListItem key={index}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Warning color="warning" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={issue} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Paper>
      )}
      
      {/* Skills */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Skills Identified
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          {analysis.skills.length > 0 ? (
            analysis.skills.map((skill, index) => (
              <Chip 
                key={index} 
                label={skill} 
                sx={{ m: 0.5 }} 
                color="primary" 
                variant="outlined" 
              />
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              No skills were identified in your resume.
            </Typography>
          )}
        </Box>
        
        {analysis.skillGaps && (
          <Box mt={3}>
            <Typography variant="subtitle1" gutterBottom>
              Skill Gaps for Your Target Roles:
            </Typography>
            <List dense>
              {analysis.skillGaps.missingSkills && analysis.skillGaps.missingSkills.map((skill: string, index: number) => (
                <ListItem key={index}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Construction fontSize="small" color="warning" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={skill} 
                    secondary={analysis.skillGaps.recommendations && analysis.skillGaps.recommendations[skill] ? 
                      analysis.skillGaps.recommendations[skill] : null} 
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Paper>
      
      {/* Missing Elements */}
      {analysis.missingElements && analysis.missingElements.length > 0 && (
        <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Missing Elements
          </Typography>
          
          <List dense>
            {analysis.missingElements.map((element: string, index: number) => (
              <ListItem key={index}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Error color="error" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={element} />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
      
      {/* Improvement Suggestions */}
      {analysis.improvementSuggestions && (
        <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Improvement Suggestions
          </Typography>
          
          <List>
            {Object.entries(analysis.improvementSuggestions).map(([section, suggestions]: [string, any], index) => (
              <Accordion key={index} defaultExpanded={index === 0}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="subtitle1">
                    {section.charAt(0).toUpperCase() + section.slice(1).replace(/([A-Z])/g, ' $1')}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List dense>
                    {Array.isArray(suggestions) ? suggestions.map((suggestion: string, idx: number) => (
                      <ListItem key={idx}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <Lightbulb color="warning" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={suggestion} />
                      </ListItem>
                    )) : (
                      <ListItem>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <Lightbulb color="warning" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={suggestions} />
                      </ListItem>
                    )}
                  </List>
                </AccordionDetails>
              </Accordion>
            ))}
          </List>
        </Paper>
      )}
      
      {/* Job Recommendations */}
      {analysis.jobRecommendations && analysis.jobRecommendations.jobs && (
        <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Job Recommendations
          </Typography>
          
          <Grid container spacing={2}>
            {analysis.jobRecommendations.jobs.map((job: any, index: number) => (
              <Grid item xs={12} md={6} key={index}>
                <Card variant="outlined">
                  <CardHeader
                    title={job.title}
                    subheader={job.company}
                    titleTypographyProps={{ variant: 'subtitle1' }}
                    subheaderTypographyProps={{ variant: 'body2' }}
                  />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {job.location}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" sx={{ mr: 1 }}>
                        Match Score:
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={job.matchScore} 
                        sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                        color={job.matchScore > 70 ? 'success' : 'primary'}
                      />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {job.matchScore}%
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" gutterBottom>
                        Key Skills:
                      </Typography>
                      {job.keySkills && job.keySkills.map((skill: string, idx: number) => (
                        <Chip 
                          key={idx} 
                          label={skill} 
                          size="small" 
                          sx={{ m: 0.3 }} 
                          variant="outlined"
                        />
                      ))}
                    </Box>
                    
                    {job.url && (
                      <Button 
                        variant="outlined" 
                        size="small" 
                        href={job.url} 
                        target="_blank" 
                        sx={{ mt: 2 }}
                      >
                        View Job
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
      
      {/* Career Path Options */}
      {analysis.careerPathOptions && analysis.careerPathOptions.paths && (
        <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Career Path Options
          </Typography>
          
          <Grid container spacing={2}>
            {analysis.careerPathOptions.paths.map((path: any, index: number) => (
              <Grid item xs={12} md={4} key={index}>
                <Card variant="outlined">
                  <CardHeader
                    title={path.title}
                    titleTypographyProps={{ variant: 'subtitle1' }}
                  />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {path.description}
                    </Typography>
                    
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" gutterBottom>
                        Required Skills:
                      </Typography>
                      {path.requiredSkills && path.requiredSkills.map((skill: string, idx: number) => (
                        <Chip 
                          key={idx} 
                          label={skill} 
                          size="small" 
                          sx={{ m: 0.3 }} 
                          variant="outlined"
                          color={analysis.skills.includes(skill) ? 'success' : 'default'}
                        />
                      ))}
                    </Box>
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" gutterBottom>
                        Growth Potential:
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <TrendingUp color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body2">
                          {path.growthPotential}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
    </Box>
  );
}