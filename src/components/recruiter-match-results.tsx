'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Chip, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon, 
  Divider, 
  CircularProgress, 
  Alert, 
  Button,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  CheckCircle, 
  Error, 
  Warning, 
  Info, 
  School, 
  Work, 
  Star, 
  ExpandMore,
  TrendingUp,
  Construction,
  Lightbulb,
  Edit,
  Visibility,
  Delete,
  Search,
  FilterList
} from '@mui/icons-material';

type RecruiterMatchProps = {
  recruiterId: string;
};

type RecruiterMatch = {
  id: string;
  recruiterId: string;
  jobTitle: string;
  jobDescription: string;
  jobRequirements: any;
  jobLocation?: string;
  candidateName: string;
  candidateEmail?: string;
  resumeText: string;
  resumeFile?: string;
  matchScore: number;
  skillMatch: any;
  experienceMatch: any;
  educationMatch: any;
  strengths: string[];
  weaknesses: string[];
  recommendations?: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export default function RecruiterMatchResults({ recruiterId }: RecruiterMatchProps) {
  const [matches, setMatches] = useState<RecruiterMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [jobTitleFilter, setJobTitleFilter] = useState('');
  const [candidateFilter, setCandidateFilter] = useState('');
  const [minScoreFilter, setMinScoreFilter] = useState('');
  
  // Selected match for details view
  const [selectedMatch, setSelectedMatch] = useState<RecruiterMatch | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editStatus, setEditStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editRecommendations, setEditRecommendations] = useState('');
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    fetchMatches();
  }, [recruiterId, statusFilter, minScoreFilter]);
  
  const fetchMatches = async () => {
    try {
      setLoading(true);
      
      let url = `/api/recruiter/match?recruiterId=${recruiterId}`;
      
      if (statusFilter !== 'all') {
        url += `&status=${statusFilter}`;
      }
      
      if (minScoreFilter) {
        url += `&minScore=${minScoreFilter}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch matches');
      }
      
      const data = await response.json();
      
      // Apply client-side filters
      let filteredData = data;
      
      if (jobTitleFilter) {
        filteredData = filteredData.filter((match: RecruiterMatch) => 
          match.jobTitle.toLowerCase().includes(jobTitleFilter.toLowerCase())
        );
      }
      
      if (candidateFilter) {
        filteredData = filteredData.filter((match: RecruiterMatch) => 
          match.candidateName.toLowerCase().includes(candidateFilter.toLowerCase())
        );
      }
      
      setMatches(filteredData);
    } catch (err) {
      console.error(err);
      setError('Failed to load matches');
    } finally {
      setLoading(false);
    }
  };
  
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleViewDetails = (match: RecruiterMatch) => {
    setSelectedMatch(match);
    setDetailsOpen(true);
  };
  
  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedMatch(null);
  };
  
  const handleEditMatch = (match: RecruiterMatch) => {
    setSelectedMatch(match);
    setEditStatus(match.status);
    setEditNotes(match.notes || '');
    setEditRecommendations(match.recommendations || '');
    setEditOpen(true);
  };
  
  const handleSaveEdit = async () => {
    if (!selectedMatch) return;
    
    setSaving(true);
    
    try {
      const response = await fetch('/api/recruiter/match', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedMatch.id,
          status: editStatus,
          notes: editNotes,
          recommendations: editRecommendations,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update match');
      }
      
      const updatedMatch = await response.json();
      
      // Update the matches list
      setMatches(matches.map(match => 
        match.id === updatedMatch.id ? updatedMatch : match
      ));
      
      setEditOpen(false);
      setSelectedMatch(null);
    } catch (err) {
      console.error(err);
      alert('Failed to update match');
    } finally {
      setSaving(false);
    }
  };
  
  const handleApplyFilters = () => {
    fetchMatches();
  };
  
  const handleClearFilters = () => {
    setStatusFilter('all');
    setJobTitleFilter('');
    setCandidateFilter('');
    setMinScoreFilter('');
    fetchMatches();
  };
  
  if (loading && matches.length === 0) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }
  
  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Resume-Job Matches
      </Typography>
      
      {/* Filters */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          <FilterList sx={{ mr: 1, verticalAlign: 'middle' }} />
          Filters
        </Typography>
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="new">New</MenuItem>
                <MenuItem value="reviewed">Reviewed</MenuItem>
                <MenuItem value="contacted">Contacted</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
                <MenuItem value="hired">Hired</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Job Title"
              size="small"
              value={jobTitleFilter}
              onChange={(e) => setJobTitleFilter(e.target.value)}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Candidate Name"
              size="small"
              value={candidateFilter}
              onChange={(e) => setCandidateFilter(e.target.value)}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Min Score"
              size="small"
              type="number"
              value={minScoreFilter}
              onChange={(e) => setMinScoreFilter(e.target.value)}
              inputProps={{ min: 0, max: 100 }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button 
                variant="outlined" 
                onClick={handleClearFilters}
              >
                Clear Filters
              </Button>
              <Button 
                variant="contained" 
                onClick={handleApplyFilters}
                startIcon={<Search />}
              >
                Apply Filters
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Results Table */}
      <Paper elevation={2} sx={{ borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Job Title</TableCell>
                <TableCell>Candidate</TableCell>
                <TableCell>Match Score</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {matches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No matches found
                  </TableCell>
                </TableRow>
              ) : (
                matches
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((match) => (
                    <TableRow key={match.id}>
                      <TableCell>{match.jobTitle}</TableCell>
                      <TableCell>{match.candidateName}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ position: 'relative', display: 'inline-flex', mr: 1 }}>
                            <CircularProgress
                              variant="determinate"
                              value={match.matchScore}
                              size={40}
                              thickness={4}
                              color={match.matchScore > 70 ? 'success' : match.matchScore > 40 ? 'warning' : 'error'}
                            />
                            <Box
                              sx={{
                                top: 0,
                                left: 0,
                                bottom: 0,
                                right: 0,
                                position: 'absolute',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Typography variant="caption" component="div" color="text.secondary">
                                {match.matchScore}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={match.status.charAt(0).toUpperCase() + match.status.slice(1)} 
                          color={
                            match.status === 'hired' ? 'success' :
                            match.status === 'rejected' ? 'error' :
                            match.status === 'contacted' ? 'info' :
                            match.status === 'reviewed' ? 'primary' :
                            'default'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{new Date(match.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small" 
                            onClick={() => handleViewDetails(match)}
                            color="primary"
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Status">
                          <IconButton 
                            size="small" 
                            onClick={() => handleEditMatch(match)}
                            color="secondary"
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={matches.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      
      {/* Details Dialog */}
      <Dialog 
        open={detailsOpen} 
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        {selectedMatch && (
          <>
            <DialogTitle>
              Match Details: {selectedMatch.candidateName} for {selectedMatch.jobTitle}
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Job Details
                  </Typography>
                  <Typography variant="subtitle1">
                    {selectedMatch.jobTitle}
                  </Typography>
                  {selectedMatch.jobLocation && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Location: {selectedMatch.jobLocation}
                    </Typography>
                  )}
                  <Typography variant="body2" paragraph>
                    {selectedMatch.jobDescription.length > 300 
                      ? selectedMatch.jobDescription.substring(0, 300) + '...' 
                      : selectedMatch.jobDescription}
                  </Typography>
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Required Skills:
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    {selectedMatch.jobRequirements.skills && 
                      selectedMatch.jobRequirements.skills.map((skill: string, index: number) => (
                        <Chip 
                          key={index} 
                          label={skill} 
                          size="small" 
                          sx={{ m: 0.3 }} 
                          variant="outlined"
                        />
                      ))}
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Candidate Details
                  </Typography>
                  <Typography variant="subtitle1">
                    {selectedMatch.candidateName}
                  </Typography>
                  {selectedMatch.candidateEmail && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Email: {selectedMatch.candidateEmail}
                    </Typography>
                  )}
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Match Score: {selectedMatch.matchScore}%
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" gutterBottom>
                        Skills Match: {selectedMatch.skillMatch.score}%
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        Experience Match: {selectedMatch.experienceMatch.score}%
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        Education Match: {selectedMatch.educationMatch.score}%
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="h6" gutterBottom>
                    Analysis
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Strengths:
                      </Typography>
                      <List dense>
                        {selectedMatch.strengths.map((strength, index) => (
                          <ListItem key={index}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <CheckCircle color="success" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={strength} />
                          </ListItem>
                        ))}
                      </List>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Areas for Improvement:
                      </Typography>
                      <List dense>
                        {selectedMatch.weaknesses.map((weakness, index) => (
                          <ListItem key={index}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <Warning color="warning" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={weakness} />
                          </ListItem>
                        ))}
                      </List>
                    </Grid>
                  </Grid>
                  
                  {selectedMatch.recommendations && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Recommendations:
                      </Typography>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="body2">
                          {selectedMatch.recommendations}
                        </Typography>
                      </Paper>
                    </Box>
                  )}
                  
                  {selectedMatch.notes && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Notes:
                      </Typography>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="body2">
                          {selectedMatch.notes}
                        </Typography>
                      </Paper>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetails}>Close</Button>
              <Button 
                variant="contained" 
                onClick={() => {
                  handleCloseDetails();
                  handleEditMatch(selectedMatch);
                }}
              >
                Edit Status
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Edit Dialog */}
      <Dialog 
        open={editOpen} 
        onClose={() => setEditOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedMatch && (
          <>
            <DialogTitle>
              Update Status: {selectedMatch.candidateName}
            </DialogTitle>
            <DialogContent dividers>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="edit-status-label">Status</InputLabel>
                <Select
                  labelId="edit-status-label"
                  value={editStatus}
                  label="Status"
                  onChange={(e) => setEditStatus(e.target.value)}
                >
                  <MenuItem value="new">New</MenuItem>
                  <MenuItem value="reviewed">Reviewed</MenuItem>
                  <MenuItem value="contacted">Contacted</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                  <MenuItem value="hired">Hired</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                label="Recommendations"
                multiline
                rows={4}
                value={editRecommendations}
                onChange={(e) => setEditRecommendations(e.target.value)}
                sx={{ mb: 3 }}
              />
              
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={4}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button 
                variant="contained" 
                onClick={handleSaveEdit}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}