'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Container,
    Paper,
    Button,
    CircularProgress,
    Tabs,
    Tab,
    Divider
} from '@mui/material';
import Grid from '@mui/material/Grid';
import ResumeUploader from '@/components/ResumeUploader';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AddIcon from '@mui/icons-material/Add';
import DescriptionIcon from '@mui/icons-material/Description';
import DeleteIcon from '@mui/icons-material/Delete';

interface Resume {
    id: string;
    title: string;
    createdAt: string;
    content: any;
}

export default function ResumesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showUploader, setShowUploader] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<number>(0);

    useEffect(() => {
        // Redirect if not authenticated
        if (status === 'unauthenticated') {
            router.push('/login');
        }

        // Fetch resumes if authenticated
        if (status === 'authenticated') {
            fetchResumes();
        }
    }, [status, router]);

    const fetchResumes = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/resumes');

            if (!response.ok) {
                throw new Error('Failed to fetch resumes');
            }

            const data = await response.json();
            setResumes(data || []);
        } catch (err: any) {
            setError(err.message || 'An error occurred while fetching resumes');
            console.error('Error fetching resumes:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteResume = async (resumeId: string) => {
        if (!confirm('Are you sure you want to delete this resume?')) {
            return;
        }

        try {
            const response = await fetch(`/api/resumes/${resumeId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete resume');
            }

            // Remove the deleted resume from the state
            setResumes(resumes.filter(resume => resume.id !== resumeId));
        } catch (err: any) {
            setError(err.message || 'An error occurred while deleting the resume');
            console.error('Error deleting resume:', err);
        }
    };

    const handleUploadComplete = (resumeId: string, parsedData: any) => {
        // Refresh the resumes list
        fetchResumes();
        // Hide the uploader
        setShowUploader(false);
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    if (status === 'loading') {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1">
                    Resume Management
                </Typography>

                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setShowUploader(!showUploader)}
                >
                    {showUploader ? 'Cancel' : 'Upload Resume'}
                </Button>
            </Box>

            {error && (
                <Paper sx={{ p: 2, mb: 4, bgcolor: 'error.light', color: 'error.contrastText' }}>
                    <Typography>{error}</Typography>
                </Paper>
            )}

            {showUploader && (
                <Box sx={{ mb: 4 }}>
                    <ResumeUploader onUploadComplete={handleUploadComplete} />
                </Box>
            )}

            <Paper sx={{ width: '100%', mb: 4 }}>
                <Tabs value={activeTab} onChange={handleTabChange} aria-label="resume tabs">
                    <Tab label="My Resumes" />
                    <Tab label="Resume Analytics" />
                </Tabs>
                <Divider />

                {activeTab === 0 && (
                    <Box sx={{ p: 3 }}>
                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : resumes.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <Typography variant="body1" color="text.secondary">
                                    You haven't uploaded any resumes yet.
                                </Typography>
                                <Button
                                    variant="outlined"
                                    startIcon={<AddIcon />}
                                    sx={{ mt: 2 }}
                                    onClick={() => setShowUploader(true)}
                                >
                                    Upload Your First Resume
                                </Button>
                            </Box>
                        ) : (
                            <Grid container spacing={3}>
                                {resumes.map((resume) => (
                                    <Grid component="div" xs={12} sm={6} md={4} key={resume.id}>
                                        <Paper
                                            elevation={2}
                                            sx={{
                                                p: 2,
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                transition: 'transform 0.2s, box-shadow 0.2s',
                                                '&:hover': {
                                                    transform: 'translateY(-4px)',
                                                    boxShadow: 4,
                                                }
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                <DescriptionIcon sx={{ mr: 1, color: 'primary.main' }} />
                                                <Typography variant="h6" noWrap title={resume.title}>
                                                    {resume.title}
                                                </Typography>
                                            </Box>

                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                Uploaded on {new Date(resume.createdAt).toLocaleDateString()}
                                            </Typography>

                                            {resume.content?.parsedData && (
                                                <Box sx={{ mt: 1, mb: 2 }}>
                                                    <Typography variant="body2" fontWeight="bold">
                                                        Skills:
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                                                        {resume.content.parsedData.skills?.slice(0, 5).map((skill: string, index: number) => (
                                                            <Box key={index} sx={{
                                                                bgcolor: 'primary.light',
                                                                color: 'primary.contrastText',
                                                                px: 1,
                                                                py: 0.25,
                                                                borderRadius: 1,
                                                                fontSize: '0.7rem'
                                                            }}>
                                                                {skill}
                                                            </Box>
                                                        ))}
                                                        {resume.content.parsedData.skills?.length > 5 && (
                                                            <Typography variant="body2" sx={{ ml: 0.5 }}>
                                                                +{resume.content.parsedData.skills.length - 5} more
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Box>
                                            )}

                                            <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between' }}>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={() => router.push(`/dashboard/resumes/${resume.id}`)}
                                                >
                                                    View Details
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    size="small"
                                                    startIcon={<DeleteIcon />}
                                                    onClick={() => handleDeleteResume(resume.id)}
                                                >
                                                    Delete
                                                </Button>
                                            </Box>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Box>
                )}

                {activeTab === 1 && (
                    <Box sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Resume Analytics
                        </Typography>
                        <Typography variant="body1">
                            This feature will show analytics and insights about your resumes, including skill gap analysis and job match recommendations.
                        </Typography>
                    </Box>
                )}
            </Paper>
        </Container>
    );
}