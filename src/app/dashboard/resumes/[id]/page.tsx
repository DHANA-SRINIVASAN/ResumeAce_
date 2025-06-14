'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  Button,
  CircularProgress,
  Divider,
  Chip,
  Card,
  CardContent,
  Alert
} from '@mui/material';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import SkillsIcon from '@mui/icons-material/Psychology';
import PersonIcon from '@mui/icons-material/Person';

export default function ResumeDetailPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [resume, setResume] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if not authenticated
    if (status === 'unauthenticated') {
      router.push('/login');
    }

    // Fetch resume if authenticated
    if (status === 'authenticated') {
      fetchResume();
    }
  }, [status, router, params.id]);

  const fetchResume = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/resumes/${params.id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch resume');
      }

      const data = await response.json();
      setResume(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching the resume');
      console.error('Error fetching resume:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResume = async () => {
    if (!confirm('Are you sure you want to delete this resume?')) {
      return;
    }

    try {
      const response = await fetch(`/api/resumes/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete resume');
      }

      // Navigate back to resumes page
      router.push('/dashboard/resumes');
    } catch (err: any) {
      setError(err.message || 'An error occurred while deleting the resume');
      console.error('Error deleting resume:', err);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/dashboard/resumes')}
          sx={{ mb: 2 }}
        >
          Back to Resumes
        </Button>

        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!resume) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/dashboard/resumes')}
          sx={{ mb: 2 }}
        >
          Back to Resumes
        </Button>

        <Alert severity="warning">
          Resume not found
        </Alert>
      </Container>
    );
  }

  const parsedData = resume.content?.parsedData || {};

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/dashboard/resumes')}
        >
          Back to Resumes
        </Button>

        <Box>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            sx={{ mr: 1 }}
            href={resume.content?.filePath}
            target="_blank"
          >
            Download
          </Button>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteResume}
          >
            Delete
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {resume.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Uploaded on {new Date(resume.createdAt).toLocaleDateString()}
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Personal Information</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Typography variant="body1" fontWeight="bold">
                {parsedData.personalInfo?.name || 'Name not found'}
              </Typography>

              <Typography variant="body2" sx={{ mt: 1 }}>
                {parsedData.personalInfo?.email || 'Email not found'}
              </Typography>

              <Typography variant="body2">
                {parsedData.personalInfo?.phone || 'Phone not found'}
              </Typography>

              <Typography variant="body2">
                {parsedData.personalInfo?.location || 'Location not found'}
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SkillsIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Skills</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {parsedData.skills && parsedData.skills.length > 0 ? (
                  parsedData.skills.map((skill: string, index: number) => (
                    <Chip
                      key={index}
                      label={skill}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ))
                ) : (
                  <Typography variant="body2">No skills found</Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Summary</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Typography variant="body1">
                {parsedData.summary || 'No summary found'}
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <WorkIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Work Experience</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {parsedData.workExperience && parsedData.workExperience.length > 0 ? (
                parsedData.workExperience.map((exp: any, index: number) => (
                  <Box key={index} sx={{ mb: 3, pb: 2, borderBottom: index < parsedData.workExperience.length - 1 ? '1px solid #eee' : 'none' }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {exp.title || 'Position not specified'}
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {exp.company || 'Company not specified'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {exp.dates || 'Dates not specified'}
                    </Typography>
                    <Typography variant="body2">
                      {exp.description || 'No description available'}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2">No work experience found</Typography>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Education</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {parsedData.education && parsedData.education.length > 0 ? (
                parsedData.education.map((edu: any, index: number) => (
                  <Box key={index} sx={{ mb: 3, pb: 2, borderBottom: index < parsedData.education.length - 1 ? '1px solid #eee' : 'none' }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {edu.degree || 'Degree not specified'}
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {edu.institution || 'Institution not specified'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {edu.dates || 'Dates not specified'}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2">No education found</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}