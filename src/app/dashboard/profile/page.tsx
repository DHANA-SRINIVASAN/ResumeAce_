'use client';

import { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import UserProfileForm from '@/components/user-profile-form';

export default function ProfilePage() {
  const [userId, setUserId] = useState<string | null>(null);
  
  useEffect(() => {
    // In a real app, you'd get this from your auth context
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);
  
  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Your Profile
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Complete your profile to get personalized job recommendations and resume feedback.
          </Typography>
        </Paper>
        
        {userId ? (
          <UserProfileForm userId={userId} />
        ) : (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography>
              Please log in to view and edit your profile.
            </Typography>
          </Paper>
        )}
      </Box>
    </Container>
  );
}