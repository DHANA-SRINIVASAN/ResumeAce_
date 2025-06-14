'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Chip,
  Paper,
  Grid,
  Autocomplete,
  FormHelperText,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';

type UserProfileData = {
  id: string;
  userId: string;
  jobTitle?: string | null;
  industry?: string | null;
  yearsOfExperience?: number | null;
  educationLevel?: string | null;
  location?: string | null;
  skills: string[];
  jobSearchStatus?: string | null;
  preferredJobTypes: string[];
  preferredLocations: string[];
  remotePreference?: string | null;
};

const industries = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
  'Retail', 'Media', 'Government', 'Non-profit', 'Construction',
  'Transportation', 'Hospitality', 'Agriculture', 'Energy', 'Legal'
];

const educationLevels = [
  'High School', 'Associate Degree', 'Bachelor\'s Degree', 
  'Master\'s Degree', 'PhD', 'Professional Degree', 'Certification'
];

const jobTypes = [
  'Full-time', 'Part-time', 'Contract', 'Freelance', 
  'Internship', 'Temporary', 'Volunteer'
];

const remoteOptions = [
  'Remote Only', 'Hybrid', 'On-site', 'Flexible'
];

const jobSearchStatuses = [
  'Actively Looking', 'Open to Opportunities', 'Not Looking'
];

export default function UserProfileForm({ userId }: { userId: string }) {
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Form state
  const [jobTitle, setJobTitle] = useState('');
  const [industry, setIndustry] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState<number | ''>('');
  const [educationLevel, setEducationLevel] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [jobSearchStatus, setJobSearchStatus] = useState('');
  const [preferredJobTypes, setPreferredJobTypes] = useState<string[]>([]);
  const [preferredLocations, setPreferredLocations] = useState<string[]>([]);
  const [remotePreference, setRemotePreference] = useState('');
  
  useEffect(() => {
    async function fetchProfileData() {
      try {
        const response = await fetch(`/api/user/signup-data?userId=${userId}`);
        
        if (response.status === 404) {
          // No profile data yet, that's okay
          setProfileData(null);
          setLoading(false);
          return;
        }
        
        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }
        
        const data = await response.json();
        setProfileData(data);
        
        // Set form state
        setJobTitle(data.jobTitle || '');
        setIndustry(data.industry || '');
        setYearsOfExperience(data.yearsOfExperience || '');
        setEducationLevel(data.educationLevel || '');
        setLocation(data.location || '');
        setSkills(data.skills || []);
        setJobSearchStatus(data.jobSearchStatus || '');
        setPreferredJobTypes(data.preferredJobTypes || []);
        setPreferredLocations(data.preferredLocations || []);
        setRemotePreference(data.remotePreference || '');
      } catch (err) {
        console.error(err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    }
    
    if (userId) {
      fetchProfileData();
    }
  }, [userId]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    try {
      const response = await fetch('/api/user/signup-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          jobTitle,
          industry,
          yearsOfExperience: yearsOfExperience === '' ? null : Number(yearsOfExperience),
          educationLevel,
          location,
          skills,
          jobSearchStatus,
          preferredJobTypes,
          preferredLocations,
          remotePreference,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save profile data');
      }
      
      const data = await response.json();
      setProfileData(data);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError('Failed to save profile data');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Your Professional Profile
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        Complete your profile to get personalized job recommendations and resume feedback.
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Current Job Title"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g., Software Engineer"
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="industry-label">Industry</InputLabel>
              <Select
                labelId="industry-label"
                value={industry}
                label="Industry"
                onChange={(e) => setIndustry(e.target.value)}
              >
                {industries.map((ind) => (
                  <MenuItem key={ind} value={ind}>{ind}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Years of Experience"
              type="number"
              value={yearsOfExperience}
              onChange={(e) => setYearsOfExperience(e.target.value === '' ? '' : Number(e.target.value))}
              inputProps={{ min: 0, max: 50 }}
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="education-label">Highest Education Level</InputLabel>
              <Select
                labelId="education-label"
                value={educationLevel}
                label="Highest Education Level"
                onChange={(e) => setEducationLevel(e.target.value)}
              >
                {educationLevels.map((level) => (
                  <MenuItem key={level} value={level}>{level}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., New York, NY"
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Autocomplete
              multiple
              freeSolo
              options={[]}
              value={skills}
              onChange={(_, newValue) => setSkills(newValue)}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip 
                    label={option} 
                    {...getTagProps({ index })} 
                    key={index}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Skills"
                  placeholder="Add skills and press Enter"
                  margin="normal"
                  helperText="Enter your professional skills one by one"
                />
              )}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="job-search-label">Job Search Status</InputLabel>
              <Select
                labelId="job-search-label"
                value={jobSearchStatus}
                label="Job Search Status"
                onChange={(e) => setJobSearchStatus(e.target.value)}
              >
                {jobSearchStatuses.map((status) => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </Select>
              <FormHelperText>Let us know your current job search status</FormHelperText>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="remote-preference-label">Remote Work Preference</InputLabel>
              <Select
                labelId="remote-preference-label"
                value={remotePreference}
                label="Remote Work Preference"
                onChange={(e) => setRemotePreference(e.target.value)}
              >
                {remoteOptions.map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <Autocomplete
              multiple
              options={jobTypes}
              value={preferredJobTypes}
              onChange={(_, newValue) => setPreferredJobTypes(newValue)}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip 
                    label={option} 
                    {...getTagProps({ index })} 
                    key={index}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Preferred Job Types"
                  placeholder="Select job types"
                  margin="normal"
                />
              )}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Autocomplete
              multiple
              freeSolo
              options={[]}
              value={preferredLocations}
              onChange={(_, newValue) => setPreferredLocations(newValue)}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip 
                    label={option} 
                    {...getTagProps({ index })} 
                    key={index}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Preferred Locations"
                  placeholder="Add locations and press Enter"
                  margin="normal"
                  helperText="Enter cities or regions where you'd like to work"
                />
              )}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={saving}
              sx={{ mt: 2 }}
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
          </Grid>
        </Grid>
      </Box>
      
      <Snackbar 
        open={success} 
        autoHideDuration={6000} 
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccess(false)}>
          Profile saved successfully!
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