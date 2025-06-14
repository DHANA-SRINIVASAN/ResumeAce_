'use client';

import { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, Button, CircularProgress, Alert } from '@mui/material';
import RecruiterMatchResults from '@/components/recruiter-match-results';

export default function RecruiterMatchesPage() {
  const [recruiterId, setRecruiterId] = useState<string | null>(null);
  
  useEffect(() => {
    // In a real app, you'd get this from your auth context
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setRecruiterId(storedUserId);
    }
  }, []);
  
  if (!recruiterId) {
    return (
      <Container maxWidth="lg">
        <Box py={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography>
              Please log in to view recruiter matches.
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
            Resume-Job Matches
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            View and manage candidate matches for your job postings.
          </Typography>
        </Paper>
        
        <RecruiterMatchResults recruiterId={recruiterId} />
      </Box>
    </Container>
  );
}