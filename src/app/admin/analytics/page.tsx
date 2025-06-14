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
  CircularProgress
} from '@mui/material';

type AppUsageStat = {
  id: string;
  userId: string | null;
  eventType: string;
  eventData: any;
  userAgent: string | null;
  ipAddress: string | null;
  referrer: string | null;
  timestamp: string;
  sessionId: string | null;
};

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<AppUsageStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  
  // Event type counts for summary
  const [eventCounts, setEventCounts] = useState<Record<string, number>>({});
  
  useEffect(() => {
    async function fetchAnalytics() {
      try {
        // In a real app, this would be a protected endpoint with authentication
        const response = await fetch('/api/analytics?admin=true');
        
        if (!response.ok) {
          throw new Error('Failed to fetch analytics data');
        }
        
        const data = await response.json();
        setStats(data);
        
        // Calculate event type counts
        const counts: Record<string, number> = {};
        data.forEach((stat: AppUsageStat) => {
          counts[stat.eventType] = (counts[stat.eventType] || 0) + 1;
        });
        setEventCounts(counts);
      } catch (err) {
        console.error(err);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    }
    
    fetchAnalytics();
  }, []);
  
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleEventTypeFilterChange = (event: any) => {
    setEventTypeFilter(event.target.value);
    setPage(0);
  };
  
  // Filter stats based on selected event type
  const filteredStats = eventTypeFilter === 'all'
    ? stats
    : stats.filter(stat => stat.eventType === eventTypeFilter);
  
  // Get unique event types for filter dropdown
  const eventTypes = Array.from(new Set(stats.map(stat => stat.eventType)));
  
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
            Analytics Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            View and analyze user activity and application usage.
          </Typography>
        </Paper>
        
        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Events
                </Typography>
                <Typography variant="h3">
                  {stats.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Unique Sessions
                </Typography>
                <Typography variant="h3">
                  {new Set(stats.map(stat => stat.sessionId).filter(Boolean)).size}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Unique Users
                </Typography>
                <Typography variant="h3">
                  {new Set(stats.map(stat => stat.userId).filter(Boolean)).size}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Event Type Summary */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Event Type Summary
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(eventCounts).map(([eventType, count]) => (
              <Grid item xs={6} sm={4} md={3} key={eventType}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      {eventType}
                    </Typography>
                    <Typography variant="h6">
                      {count}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
        
        {/* Filter Controls */}
        <Box sx={{ mb: 3 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="event-type-filter-label">Event Type</InputLabel>
            <Select
              labelId="event-type-filter-label"
              value={eventTypeFilter}
              label="Event Type"
              onChange={handleEventTypeFilterChange}
            >
              <MenuItem value="all">All Events</MenuItem>
              {eventTypes.map(type => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        
        {/* Data Table */}
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Event Type</TableCell>
                  <TableCell>User ID</TableCell>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Session ID</TableCell>
                  <TableCell>Event Data</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStats
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((stat) => (
                    <TableRow key={stat.id}>
                      <TableCell>{stat.eventType}</TableCell>
                      <TableCell>{stat.userId || 'Anonymous'}</TableCell>
                      <TableCell>{new Date(stat.timestamp).toLocaleString()}</TableCell>
                      <TableCell>{stat.sessionId || 'N/A'}</TableCell>
                      <TableCell>
                        {stat.eventData ? JSON.stringify(stat.eventData) : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                {filteredStats.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50, 100]}
            component="div"
            count={filteredStats.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </Box>
    </Container>
  );
}