'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Typography, Box, Paper } from '@mui/material';
import TemplateGallery from '@/components/templates/TemplateGallery';
import { trackTemplateSelected, trackPageView } from '@/lib/analytics';

type ResumeTemplate = {
    id: string;
    name: string;
    description: string;
    previewImageUrl: string;
    isDefault: boolean;
};

export default function TemplatesPage() {
    const router = useRouter();
    
    // Track page view when component mounts
    useState(() => {
        trackPageView('templates_page');
    }, []);

    const handleSelectTemplate = async (template: ResumeTemplate) => {
        try {
            // Track template selection
            trackTemplateSelected(template.id, template.name);
            
            // Store the selected template in localStorage
            localStorage.setItem('selectedTemplate', JSON.stringify(template));

            // If user is logged in, create a resume with the selected template
            // This is a simplified example - in a real app, you'd get the userId from auth context
            const userId = localStorage.getItem('userId');

            if (userId) {
                // Create a resume with the selected template
                const response = await fetch('/api/resumes/create-with-template', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId,
                        templateId: template.id,
                        title: `My ${template.name} Resume`,
                    }),
                });

                if (response.ok) {
                    const resume = await response.json();
                    // Navigate to the resume editor with the new resume ID
                    router.push(`/dashboard/resumes/${resume.id}`);
                    return;
                }
            }

            // If user is not logged in or resume creation failed, just go to the builder
            router.push('/builder/new');
        } catch (error) {
            console.error('Error selecting template:', error);
            // Navigate to the builder anyway as fallback
            router.push('/builder/new');
        }
    };

    return (
        <Container maxWidth="lg">
            <Box py={4}>
                <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Choose a Resume Template
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                        Select a template to get started with your professional resume. You can customize it later.
                    </Typography>
                </Paper>

                <TemplateGallery onSelect={handleSelectTemplate} />
            </Box>
        </Container>
    );
}