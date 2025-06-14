'use client';

import { useState, useEffect } from 'react';
import { Box, Grid, Card, CardContent, Typography, CardMedia, Button, CircularProgress } from '@mui/material';

type ResumeTemplate = {
    id: string;
    name: string;
    description: string;
    previewImageUrl: string;
    isDefault: boolean;
};

export default function TemplateGallery({ onSelect }: { onSelect: (template: ResumeTemplate) => void }) {
    const [templates, setTemplates] = useState<ResumeTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchTemplates() {
            try {
                const response = await fetch('/api/templates');
                if (!response.ok) {
                    throw new Error('Failed to fetch templates');
                }
                const data = await response.json();
                setTemplates(data);
            } catch (err) {
                setError('Error loading templates. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        fetchTemplates();
    }, []);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box textAlign="center" p={3}>
                <Typography color="error">{error}</Typography>
                <Button variant="contained" onClick={() => window.location.reload()} sx={{ mt: 2 }}>
                    Try Again
                </Button>
            </Box>
        );
    }

    return (
        <Grid container spacing={3}>
            {templates.map((template) => (
                <Grid item xs={12} sm={6} md={4} key={template.id}>
                    <Card
                        sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            '&:hover': {
                                transform: 'translateY(-5px)',
                                boxShadow: 6,
                            }
                        }}
                    >
                        <CardMedia
                            component="img"
                            height="200"
                            image={
                                // Use placeholder images if the actual images are not available
                                template.previewImageUrl.startsWith('/templates/')
                                    ? `https://placehold.co/600x800/${template.name === 'Professional' ? 'e2e8f0/1e293b?text=Professional+Template' :
                                        template.name === 'Creative' ? 'fef3c7/854d0e?text=Creative+Template' :
                                            'f0f9ff/0c4a6e?text=Academic+Template'}`
                                    : template.previewImageUrl || 'https://placehold.co/600x800/e2e8f0/1e293b?text=Default+Template'
                            }
                            alt={template.name}
                            sx={{ objectFit: 'contain', p: 2 }}
                        />
                        <CardContent sx={{ flexGrow: 1 }}>
                            <Typography gutterBottom variant="h6" component="div">
                                {template.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {template.description}
                            </Typography>
                            <Button
                                variant="contained"
                                fullWidth
                                onClick={() => onSelect(template)}
                            >
                                Use This Template
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
}