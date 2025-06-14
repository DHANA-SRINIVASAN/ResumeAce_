import React, { useState } from 'react';
import { Button, Box, Typography, CircularProgress, Paper, Alert } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

interface ResumeUploaderProps {
  onUploadComplete?: (resumeId: string, parsedData: any) => void;
}

const ResumeUploader: React.FC<ResumeUploaderProps> = ({ onUploadComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<any>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setParsedData(null);

      // Step 1: Upload the resume file
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('/api/resumes/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Failed to upload resume');
      }

      const uploadData = await uploadResponse.json();
      setSuccess('Resume uploaded successfully! Extracting text...');

      // Step 2: Extract text from the resume
      const extractResponse = await fetch('/api/resumes/extract-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resumeId: uploadData.resumeId }),
      });

      if (!extractResponse.ok) {
        const errorData = await extractResponse.json();
        throw new Error(errorData.error || 'Failed to extract text from resume');
      }

      const extractData = await extractResponse.json();
      setSuccess('Text extracted successfully! Parsing resume...');

      // Step 3: Parse the resume text
      const parseResponse = await fetch('/api/resumes/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          resumeId: uploadData.resumeId,
          resumeText: extractData.text,
        }),
      });

      if (!parseResponse.ok) {
        const errorData = await parseResponse.json();
        throw new Error(errorData.error || 'Failed to parse resume');
      }

      const parseData = await parseResponse.json();
      setParsedData(parseData.parsedData);
      setSuccess('Resume processed successfully!');

      // Call the callback function if provided
      if (onUploadComplete) {
        onUploadComplete(uploadData.resumeId, parseData.parsedData);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while processing the resume');
      console.error('Resume upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Upload Your Resume
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Upload your resume in PDF or DOCX format. We'll extract and parse the information automatically.
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 3 }}>
          <input
            accept=".pdf,.docx"
            style={{ display: 'none' }}
            id="resume-file-upload"
            type="file"
            onChange={handleFileChange}
            disabled={loading}
          />
          <label htmlFor="resume-file-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<CloudUploadIcon />}
              disabled={loading}
              sx={{ mb: 2 }}
            >
              Select File
            </Button>
          </label>
          
          {file && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Selected file: {file.name}
            </Typography>
          )}
          
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpload}
            disabled={!file || loading}
            sx={{ mt: 2 }}
          >
            {loading ? 'Processing...' : 'Upload & Process'}
          </Button>
          
          {loading && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
              <CircularProgress size={24} sx={{ mr: 1 }} />
              <Typography variant="body2">Processing your resume...</Typography>
            </Box>
          )}
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && !error && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {success}
          </Alert>
        )}
        
        {parsedData && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Extracted Information
            </Typography>
            
            <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
              <Typography variant="subtitle1">Personal Information</Typography>
              <Typography variant="body2">
                Name: {parsedData.personalInfo?.name || 'N/A'}<br />
                Email: {parsedData.personalInfo?.email || 'N/A'}<br />
                Phone: {parsedData.personalInfo?.phone || 'N/A'}<br />
                Location: {parsedData.personalInfo?.location || 'N/A'}
              </Typography>
            </Paper>
            
            <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
              <Typography variant="subtitle1">Summary</Typography>
              <Typography variant="body2">{parsedData.summary || 'No summary found'}</Typography>
            </Paper>
            
            <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
              <Typography variant="subtitle1">Skills</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {parsedData.skills && parsedData.skills.length > 0 ? (
                  parsedData.skills.map((skill: string, index: number) => (
                    <Box key={index} sx={{ 
                      bgcolor: 'primary.light', 
                      color: 'primary.contrastText',
                      px: 1, 
                      py: 0.5, 
                      borderRadius: 1,
                      fontSize: '0.8rem'
                    }}>
                      {skill}
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2">No skills found</Typography>
                )}
              </Box>
            </Paper>
            
            <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
              <Typography variant="subtitle1">Work Experience</Typography>
              {parsedData.workExperience && parsedData.workExperience.length > 0 ? (
                parsedData.workExperience.map((exp: any, index: number) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Typography variant="body1" fontWeight="bold">{exp.title || 'N/A'}</Typography>
                    <Typography variant="body2">{exp.company || 'N/A'}</Typography>
                    <Typography variant="body2" color="text.secondary">{exp.dates || 'N/A'}</Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>{exp.description || 'No description'}</Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2">No work experience found</Typography>
              )}
            </Paper>
            
            <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
              <Typography variant="subtitle1">Education</Typography>
              {parsedData.education && parsedData.education.length > 0 ? (
                parsedData.education.map((edu: any, index: number) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Typography variant="body1" fontWeight="bold">{edu.degree || 'N/A'}</Typography>
                    <Typography variant="body2">{edu.institution || 'N/A'}</Typography>
                    <Typography variant="body2" color="text.secondary">{edu.dates || 'N/A'}</Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2">No education found</Typography>
              )}
            </Paper>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ResumeUploader;