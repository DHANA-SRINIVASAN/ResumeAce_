'use client';

import { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating
} from '@mui/material';

type FeedbackItem = {
  id: string;
  userId: string | null;
  feedbackType: string;
  content: string;
  rating: number | null;
  status: string;
  adminResponse: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  } | null;
};

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  // For response dialog
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [responseStatus, setResponseStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Summary stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewed: 0,
    implemented: 0,
    bugs: 0,
    features: 0,
    general: 0,
    avgRating: 0,
  });
  
  useEffect(() => {
    async function fetchFeedback() {
      try {
        // In a real app, this would be a protected endpoint with authentication
        const response = await fetch('/api/feedback');
        
        if (!response.ok) {
          throw new Error('Failed to fetch feedback data');
        }
        
        const data = await response.json();
        setFeedback(data);
        
        // Calculate summary stats
        const pendingCount = data.filter((item: FeedbackItem) => item.status === 'pending').length;
        const reviewedCount = data.filter((item: FeedbackItem) => item.status === 'reviewed').length;
        const implementedCount = data.filter((item: FeedbackItem) => item.status === 'implemented').length;
        
        const bugsCount = data.filter((item: FeedbackItem) => item.feedbackType === 'bug').length;
        const featuresCount = data.filter((item: FeedbackItem) => item.feedbackType === 'feature_request').length;
        const generalCount = data.filter((item: FeedbackItem) => item.feedbackType === 'general').length;
        
        const ratings = data.filter((item: FeedbackItem) => item.rating !== null).map((item: FeedbackItem) => item.rating);
        const avgRating = ratings.length > 0 
          ? ratings.reduce((sum: number, rating: number) => sum + (rating || 0), 0) / ratings.length 
          : 0;
        
        setStats({
          total: data.length,
          pending: pendingCount,
          reviewed: reviewedCount,
          implemented: implementedCount,
          bugs: bugsCount,
          features: featuresCount,
          general: generalCount,
          avgRating,
        });
      } catch (err) {
        console.error(err);
        setError('Failed to load feedback data');
      } finally {
        setLoading(false);
      }
    }
    
    fetchFeedback();
  }, []);
  
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleStatusFilterChange = (event: any) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };
  
  const handleTypeFilterChange = (event: any) => {
    setTypeFilter(event.target.value);
    setPage(0);
  };
  
  const handleOpenResponseDialog = (item: FeedbackItem) => {
    setSelectedFeedback(item);
    setAdminResponse(item.adminResponse || '');
    setResponseStatus(item.status);
    setResponseDialogOpen(true);
  };
  
  const handleCloseResponseDialog = () => {
    setResponseDialogOpen(false);
    setSelectedFeedback(null);
    setAdminResponse('');
  };
  
  const handleSubmitResponse = async () => {
    if (!selectedFeedback) return;
    
    setSubmitting(true);
    
    try {
      // In a real app, this would update the feedback with the admin response
      // For now, we'll just simulate it by updating the local state
      
      const updatedFeedback = feedback.map(item => 
        item.id === selectedFeedback.id 
          ? { ...item, adminResponse, status: responseStatus, updatedAt: new Date().toISOString() }
          : item
      );
      
      setFeedback(updatedFeedback);
      
      // Recalculate stats
      const pendingCount = updatedFeedback.filter(item => item.status === 'pending').length;
      const reviewedCount = updatedFeedback.filter(item => item.status === 'reviewed').length;
      const implementedCount = updatedFeedback.filter(item => item.status === 'implemented').length;
      
      setStats({
        ...stats,
        pending: pendingCount,
        reviewed: reviewedCount,
        implemented: implementedCount,
      });
      
      handleCloseResponseDialog();
    } catch (err) {
      console.error(err);
      alert('Failed to update feedback');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Filter feedback based on selected filters
  const filteredFeedback = feedback.filter(item => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (typeFilter !== 'all' && item.feedbackType !== typeFilter) return false;
    return true;
  });
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="lg">
        <Box py={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="error">{error}</Typography>
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
            Feedback Management
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Review and respond to user feedback.
          </Typography>
        </Paper>
        
        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Feedback
                </Typography>
                <Typography variant="h3">
                  {stats.total}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Average Rating
                </Typography>
                <Box display="flex" alignItems="center">
                  <Typography variant="h3" sx={{ mr: 1 }}>
                    {stats.avgRating.toFixed(1)}
                  </Typography>
                  <Rating value={stats.avgRating} precision={0.5} readOnly />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Pending
                </Typography>
                <Typography variant="h3" color="warning.main">
                  {stats.pending}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Implemented
                </Typography>
                <Typography variant="h3" color="success.main">
                  {stats.implemented}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Type Summary */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Feedback Type Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    Bug Reports
                  </Typography>
                  <Typography variant="h6" color="error.main">
                    {stats.bugs}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    Feature Requests
                  </Typography>
                  <Typography variant="h6" color="primary.main">
                    {stats.features}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    General Feedback
                  </Typography>
                  <Typography variant="h6">
                    {stats.general}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
        
        {/* Filter Controls */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              value={statusFilter}
              label="Status"
              onChange={handleStatusFilterChange}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="reviewed">Reviewed</MenuItem>
              <MenuItem value="implemented">Implemented</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="type-filter-label">Type</InputLabel>
            <Select
              labelId="type-filter-label"
              value={typeFilter}
              label="Type"
              onChange={handleTypeFilterChange}
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="bug">Bug Reports</MenuItem>
              <MenuItem value="feature_request">Feature Requests</MenuItem>
              <MenuItem value="general">General Feedback</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        {/* Data Table */}
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Content</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredFeedback
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Chip 
                          label={item.feedbackType === 'bug' ? 'Bug' : 
                                item.feedbackType === 'feature_request' ? 'Feature' : 'General'} 
                          color={item.feedbackType === 'bug' ? 'error' : 
                                item.feedbackType === 'feature_request' ? 'primary' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={item.status.charAt(0).toUpperCase() + item.status.slice(1)} 
                          color={item.status === 'pending' ? 'warning' : 
                                item.status === 'implemented' ? 'success' : 'info'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{item.user ? item.user.name || item.user.email : 'Anonymous'}</TableCell>
                      <TableCell sx={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.content}
                      </TableCell>
                      <TableCell>
                        {item.rating !== null ? (
                          <Rating value={item.rating} readOnly size="small" />
                        ) : (
                          'N/A'
                        )}
                      </TableCell>
                      <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button 
                          variant="outlined" 
                          size="small"
                          onClick={() => handleOpenResponseDialog(item)}
                        >
                          Respond
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                {filteredFeedback.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No feedback available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50, 100]}
            component="div"
            count={filteredFeedback.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </Box>
      
      {/* Response Dialog */}
      <Dialog open={responseDialogOpen} onClose={handleCloseResponseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Respond to Feedback</DialogTitle>
        <DialogContent>
          {selectedFeedback && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Feedback from: {selectedFeedback.user ? selectedFeedback.user.name || selectedFeedback.user.email : 'Anonymous'}
              </Typography>
              
              <Typography variant="subtitle2" gutterBottom>
                Type: {selectedFeedback.feedbackType === 'bug' ? 'Bug Report' : 
                      selectedFeedback.feedbackType === 'feature_request' ? 'Feature Request' : 'General Feedback'}
              </Typography>
              
              <Paper variant="outlined" sx={{ p: 2, my: 2, bgcolor: 'background.default' }}>
                <Typography variant="body1">
                  {selectedFeedback.content}
                </Typography>
                
                {selectedFeedback.rating !== null && (
                  <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>Rating:</Typography>
                    <Rating value={selectedFeedback.rating} readOnly size="small" />
                  </Box>
                )}
              </Paper>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="response-status-label">Status</InputLabel>
                <Select
                  labelId="response-status-label"
                  value={responseStatus}
                  label="Status"
                  onChange={(e) => setResponseStatus(e.target.value)}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="reviewed">Reviewed</MenuItem>
                  <MenuItem value="implemented">Implemented</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                label="Your Response"
                multiline
                rows={4}
                fullWidth
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                placeholder="Enter your response to this feedback..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseResponseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmitResponse} 
            variant="contained" 
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Response'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}