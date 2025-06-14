'use client';

import { Container, Typography, Box, Paper, Grid, Card, CardContent, Button } from '@mui/material';
import Link from 'next/link';
import { BarChart, PieChart, Activity, MessageSquare, Settings, Users, FileText } from 'lucide-react';

export default function AdminDashboardPage() {
    return (
        <Container maxWidth="lg">
            <Box py={4}>
                <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Admin Dashboard
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                        Manage your ResumeAce application settings, users, and content.
                    </Typography>
                </Paper>

                <Grid container spacing={3}>
                    {/* Analytics Card */}
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Box display="flex" alignItems="center" mb={2}>
                                    <BarChart size={24} className="text-primary" />
                                    <Typography variant="h6" component="h2" ml={1}>
                                        Analytics
                                    </Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    View detailed analytics about user activity, page views, and feature usage.
                                </Typography>
                                <Button component={Link} href="/admin/analytics" variant="outlined" fullWidth>
                                    View Analytics
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Feedback Card */}
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Box display="flex" alignItems="center" mb={2}>
                                    <MessageSquare size={24} className="text-primary" />
                                    <Typography variant="h6" component="h2" ml={1}>
                                        Feedback
                                    </Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    Review and respond to user feedback, bug reports, and feature requests.
                                </Typography>
                                <Button component={Link} href="/admin/feedback" variant="outlined" fullWidth>
                                    Manage Feedback
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Settings Card */}
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Box display="flex" alignItems="center" mb={2}>
                                    <Settings size={24} className="text-primary" />
                                    <Typography variant="h6" component="h2" ml={1}>
                                        Settings
                                    </Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    Configure application settings, feature flags, and system parameters.
                                </Typography>
                                <Button component={Link} href="/admin/settings" variant="outlined" fullWidth>
                                    Manage Settings
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Users Card */}
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Box display="flex" alignItems="center" mb={2}>
                                    <Users size={24} className="text-primary" />
                                    <Typography variant="h6" component="h2" ml={1}>
                                        Users
                                    </Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    Manage user accounts, permissions, and profile information.
                                </Typography>
                                <Button component={Link} href="/admin/users" variant="outlined" fullWidth>
                                    Manage Users
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Templates Card */}
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Box display="flex" alignItems="center" mb={2}>
                                    <FileText size={24} className="text-primary" />
                                    <Typography variant="h6" component="h2" ml={1}>
                                        Templates
                                    </Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    Manage resume templates, add new ones, or modify existing templates.
                                </Typography>
                                <Button component={Link} href="/admin/templates" variant="outlined" fullWidth>
                                    Manage Templates
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Activity Card */}
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Box display="flex" alignItems="center" mb={2}>
                                    <Activity size={24} className="text-primary" />
                                    <Typography variant="h6" component="h2" ml={1}>
                                        System Status
                                    </Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    Monitor system health, performance metrics, and error logs.
                                </Typography>
                                <Button component={Link} href="/admin/status" variant="outlined" fullWidth>
                                    View Status
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
}