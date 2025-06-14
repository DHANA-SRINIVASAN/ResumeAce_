'use client';

import { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Button,
    CircularProgress,
    Alert,
    TextField,
    Grid,
    Snackbar
} from '@mui/material';
import { useRouter } from 'next/navigation';

export default function CreateMatchPage() {
    const router = useRouter();
    const [recruiterId, setRecruiterId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        // In a real app, you'd get this from your auth context
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) {
            setRecruiterId(storedUserId);
        }
    }, []);

    const handleCreateMatch = async () => {
        if (!recruiterId) return;

        setLoading(true);
        setError(null);

        try {
            // Create a mock match
            const mockMatch = {
                recruiterId,
                jobTitle: "Senior Frontend Developer",
                jobDescription: "We are looking for a Senior Frontend Developer with experience in React, TypeScript, and modern web development practices.",
                jobRequirements: {
                    skills: ["React", "TypeScript", "JavaScript", "HTML", "CSS", "Redux"],
                    experience: "5+ years",
                    education: "Bachelor's degree in Computer Science or related field"
                },
                jobLocation: "New York, NY (Remote Option Available)",
                candidateName: "John Smith",
                candidateEmail: "john.smith@example.com",
                resumeText: "Experienced frontend developer with 6 years of experience in React, JavaScript, and TypeScript. Worked at major tech companies developing complex web applications.",
                matchScore: 85,
                skillMatch: {
                    score: 90,
                    matched: ["React", "TypeScript", "JavaScript", "HTML", "CSS"],
                    missing: ["Redux"]
                },
                experienceMatch: {
                    score: 85,
                    details: "Candidate has 6 years of experience, meeting the 5+ year requirement."
                },
                educationMatch: {
                    score: 80,
                    details: "Candidate has a Bachelor's degree in Computer Science."
                },
                strengths: [
                    "Strong experience with React and TypeScript",
                    "Extensive frontend development background",
                    "Good match for technical requirements"
                ],
                weaknesses: [
                    "No explicit Redux experience mentioned",
                    "Limited information about team leadership"
                ]
            };

            const response = await fetch('/api/recruiter/match', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(mockMatch),
            });

            if (!response.ok) {
                throw new Error('Failed to create match');
            }

            setSuccess(true);

            // Redirect after a short delay
            setTimeout(() => {
                router.push('/recruiter/matches');
            }, 2000);
        } catch (err) {
            console.error(err);
            setError('Failed to create match');
        } finally {
            setLoading(false);
        }
    };

    if (!recruiterId) {
        return (
            <Container maxWidth="lg">
                <Box py={4}>
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                        <Typography>
                            Please log in to create recruiter matches.
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
                        Create Demo Match
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                        This page creates a sample resume-job match for demonstration purposes.
                    </Typography>
                </Paper>

                <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Sample Match Details
                    </Typography>

                    <Grid container spacing={3}>
                        <Grid xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Job Title"
                                value="Senior Frontend Developer"
                                disabled
                                margin="normal"
                            />
                        </Grid>

                        <Grid xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Candidate Name"
                                value="John Smith"
                                disabled
                                margin="normal"
                            />
                        </Grid>

                        <Grid xs={12}>
                            <TextField
                                fullWidth
                                label="Job Description"
                                value="We are looking for a Senior Frontend Developer with experience in React, TypeScript, and modern web development practices."
                                disabled
                                multiline
                                rows={2}
                                margin="normal"
                            />
                        </Grid>

                        <Grid xs={12}>
                            <TextField
                                fullWidth
                                label="Resume Text"
                                value="Experienced frontend developer with 6 years of experience in React, JavaScript, and TypeScript. Worked at major tech companies developing complex web applications."
                                disabled
                                multiline
                                rows={2}
                                margin="normal"
                            />
                        </Grid>

                        <Grid xs={12}>
                            <TextField
                                fullWidth
                                label="Match Score"
                                value="85%"
                                disabled
                                margin="normal"
                            />
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="contained"
                            onClick={handleCreateMatch}
                            disabled={loading}
                        >
                            {loading ? 'Creating...' : 'Create Demo Match'}
                        </Button>
                    </Box>
                </Paper>

                <Snackbar
                    open={success}
                    autoHideDuration={6000}
                    onClose={() => setSuccess(false)}
                    message="Match created successfully! Redirecting to matches page..."
                />

                {error && (
                    <Alert severity="error" sx={{ mt: 3 }}>
                        {error}
                    </Alert>
                )}
            </Box>
        </Container>
    );
}