'use client';

import { useEffect } from 'react';
import { Container, Typography, Box, Grid, Paper } from '@mui/material';
import FeedbackForm from '@/components/feedback-form';
import { trackPageView } from '@/lib/analytics';

export default function FeedbackPage() {
  // Track page view
  useEffect(() => {
    trackPageView('feedback_page');
  }, []);

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Feedback
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            We're constantly working to improve ResumeAce. Your feedback helps us make it better.
          </Typography>
        </Paper>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <FeedbackForm />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Other Ways to Reach Us
              </Typography>
              
              <Typography variant="body2" paragraph>
                If you prefer, you can also reach us through these channels:
              </Typography>
              
              <Box component="ul" sx={{ pl: 2 }}>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Email: support@resumeace.com
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Twitter: @ResumeAce
                </Typography>
                <Typography component="li" variant="body2">
                  GitHub: github.com/resumeace/issues
                </Typography>
              </Box>
              
              <Typography variant="body2" sx={{ mt: 3 }}>
                We typically respond within 24-48 hours during business days.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}