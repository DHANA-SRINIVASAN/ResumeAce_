'use client';

import { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Rating, 
  Snackbar, 
  Alert,
  Paper
} from '@mui/material';

type FeedbackType = 'bug' | 'feature_request' | 'general';

export default function FeedbackForm() {
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('general');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Please provide feedback content');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get user ID if available (in a real app, you'd get this from auth context)
      const userId = localStorage.getItem('userId');
      
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId || undefined,
          feedbackType,
          content,
          rating,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }
      
      // Reset form
      setFeedbackType('general');
      setContent('');
      setRating(null);
      setSuccess(true);
    } catch (err) {
      setError('Failed to submit feedback. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        We Value Your Feedback
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        Help us improve ResumeAce by sharing your thoughts, reporting issues, or suggesting new features.
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
        <FormControl fullWidth margin="normal">
          <InputLabel id="feedback-type-label">Feedback Type</InputLabel>
          <Select
            labelId="feedback-type-label"
            value={feedbackType}
            label="Feedback Type"
            onChange={(e) => setFeedbackType(e.target.value as FeedbackType)}
          >
            <MenuItem value="general">General Feedback</MenuItem>
            <MenuItem value="bug">Report a Bug</MenuItem>
            <MenuItem value="feature_request">Feature Request</MenuItem>
          </Select>
        </FormControl>
        
        <TextField
          margin="normal"
          required
          fullWidth
          multiline
          rows={4}
          label="Your Feedback"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            feedbackType === 'bug' 
              ? 'Please describe the issue you encountered and steps to reproduce it...' 
              : feedbackType === 'feature_request'
              ? 'Please describe the feature you would like to see...'
              : 'Share your thoughts about ResumeAce...'
          }
        />
        
        <Box sx={{ mt: 2, mb: 3 }}>
          <Typography component="legend" gutterBottom>
            Rate your experience (optional)
          </Typography>
          <Rating
            name="experience-rating"
            value={rating}
            onChange={(_, newValue) => {
              setRating(newValue);
            }}
            size="large"
          />
        </Box>
        
        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          sx={{ mt: 2 }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </Button>
      </Box>
      
      <Snackbar 
        open={success} 
        autoHideDuration={6000} 
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccess(false)}>
          Thank you for your feedback! We appreciate your input.
        </Alert>
      </Snackbar>
      
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Paper>
  );
}