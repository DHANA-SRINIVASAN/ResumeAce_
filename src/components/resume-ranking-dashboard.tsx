// src/components/resume-ranking-dashboard.tsx
"use client";

import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  FileText,
  User,
  CheckCircle,
  XCircle,
  Download,
  Filter,
  SortAsc,
  SortDesc,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  List,
  Trophy,
  Medal,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Define the type for a resume match result
interface ResumeMatchResult {
  resumeId: string;
  resumeTitle: string;
  matchId: string;
  matchScore: number;
  assessment: string;
  keyMatches: string[];
  keyMismatches: string[];
  candidateName?: string;
}

interface ResumeRankingDashboardProps {
  results: ResumeMatchResult[];
  jobDescription?: string;
  onViewDetails?: (resumeId: string) => void;
  onDownloadReport?: () => void;
}

// Color constants
const COLORS = {
  excellent: '#22c55e', // green-500
  good: '#3b82f6',     // blue-500
  fair: '#f59e0b',     // amber-500
  poor: '#ef4444',     // red-500
};

const PIE_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444'];

export function ResumeRankingDashboard({
  results,
  jobDescription = "",
  onViewDetails = () => { },
  onDownloadReport = () => { }
}: ResumeRankingDashboardProps) {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterThreshold, setFilterThreshold] = useState<number | null>(null);
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');
  const [activeTab, setActiveTab] = useState('ranking');

  // Sort and filter results
  const processedResults = [...results]
    .filter(result => filterThreshold === null || result.matchScore >= filterThreshold)
    .sort((a, b) => {
      return sortOrder === 'desc'
        ? b.matchScore - a.matchScore
        : a.matchScore - b.matchScore;
    });

  // Get top 3 candidates
  const topCandidates = processedResults.slice(0, 3);

  // Prepare data for charts
  const barChartData = processedResults.map(result => {
    // Extract candidate name from the result
    // If candidateName is available, use it; otherwise try to extract a name from resumeTitle
    let displayName = result.candidateName;

    if (!displayName) {
      // Try to extract a name from the resume title if it looks like a name
      const nameParts = result.resumeTitle.split(/[_\-\s]+/).filter(Boolean);
      if (nameParts.length >= 2) {
        // If we have at least two parts, assume it might be a first and last name
        const firstName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1).toLowerCase();
        const lastName = nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1).toLowerCase();
        displayName = `${firstName} ${lastName}`;
      } else {
        // Otherwise just use the resume title
        displayName = result.resumeTitle;
      }
    }

    return {
      name: displayName.length > 20 ? displayName.substring(0, 20) + '...' : displayName,
      score: result.matchScore,
      fullName: displayName,
    };
  });

  // Prepare pie chart data - group by assessment category
  const assessmentCounts = processedResults.reduce((acc, result) => {
    const assessment = result.assessment.toLowerCase();
    const category = assessment.includes('excellent') ? 'Excellent'
      : assessment.includes('good') ? 'Good'
        : assessment.includes('fair') ? 'Fair'
          : 'Poor';

    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieChartData = Object.entries(assessmentCounts).map(([name, value]) => ({
    name,
    value,
  }));

  const getScoreColor = (score: number): string => {
    if (score >= 80) return COLORS.excellent;
    if (score >= 70) return COLORS.good;
    if (score >= 50) return COLORS.fair;
    return COLORS.poor;
  };

  const getAssessmentColor = (assessment: string): string => {
    const lowerAssessment = assessment.toLowerCase();
    if (lowerAssessment.includes('excellent')) return COLORS.excellent;
    if (lowerAssessment.includes('good')) return COLORS.good;
    if (lowerAssessment.includes('fair')) return COLORS.fair;
    return COLORS.poor;
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
  };

  const handleFilterChange = (value: string) => {
    setFilterThreshold(value === 'all' ? null : parseInt(value));
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const score = payload[0].value;
      const assessment = score >= 80 ? "Excellent" :
        score >= 70 ? "Good" :
          score >= 50 ? "Fair" : "Poor";

      return (
        <div className="bg-background p-3 border border-border rounded-md shadow-md">
          <p className="font-medium text-base">{payload[0].payload.fullName}</p>
          <div className="flex items-center mt-1">
            <span className="text-sm font-semibold mr-2">Match Score:</span>
            <span
              className="text-sm font-bold"
              style={{ color: getScoreColor(score) }}
            >
              {score}%
            </span>
          </div>
          <div className="text-xs mt-1">
            <span className="text-muted-foreground">Assessment: </span>
            <span style={{ color: getScoreColor(score) }}>{assessment}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Resume Ranking Results</h2>
          <p className="text-muted-foreground">
            {processedResults.length} candidate{processedResults.length !== 1 ? 's' : ''} matched against job description
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Select onValueChange={handleFilterChange} defaultValue="all">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by score" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Scores</SelectItem>
              <SelectItem value="80">80+ (Excellent)</SelectItem>
              <SelectItem value="70">70+ (Good)</SelectItem>
              <SelectItem value="50">50+ (Fair)</SelectItem>
              <SelectItem value="0">All Scores</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={toggleSortOrder}>
            {sortOrder === 'desc' ? <SortDesc className="h-4 w-4" /> : <SortAsc className="h-4 w-4" />}
          </Button>

          <Button variant="outline" onClick={onDownloadReport}>
            <Download className="h-4 w-4 mr-2" /> Export Report
          </Button>
        </div>
      </div>

      {/* Top Candidates Section */}
      {topCandidates.length > 0 && (
        <Card className="border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
              Top Matching Candidates
            </CardTitle>
            <CardDescription>
              The best matches for your job description
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topCandidates.map((candidate, index) => {
                const icons = [
                  <Trophy key="trophy" className="h-8 w-8 text-yellow-500" />,
                  <Medal key="medal" className="h-8 w-8 text-gray-400" />,
                  <Award key="award" className="h-8 w-8 text-amber-700" />
                ];

                const positions = ["1st", "2nd", "3rd"];

                return (
                  <Card key={candidate.resumeId} className={cn(
                    "overflow-hidden border-2",
                    index === 0 ? "border-yellow-500" :
                      index === 1 ? "border-gray-400" :
                        "border-amber-700"
                  )}>
                    <div className="p-4 bg-muted/30 flex items-center justify-between">
                      <div className="flex items-center">
                        {icons[index]}
                        <span className="ml-2 font-bold">{positions[index]} Place</span>
                      </div>
                      <Badge
                        style={{
                          backgroundColor: getScoreColor(candidate.matchScore),
                          color: 'white'
                        }}
                      >
                        {candidate.matchScore}%
                      </Badge>
                    </div>
                    <CardContent className="pt-4">
                      <h3 className="text-lg font-semibold truncate">
                        {candidate.candidateName || candidate.resumeTitle}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {candidate.assessment}
                      </p>

                      <div className="mt-2">
                        <h4 className="text-sm font-medium flex items-center text-green-600">
                          <CheckCircle className="h-4 w-4 mr-1" /> Key Strengths
                        </h4>
                        <ul className="mt-1 space-y-1">
                          {candidate.keyMatches.slice(0, 2).map((match, i) => (
                            <li key={i} className="text-xs text-muted-foreground">
                              • {match}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t bg-muted/20 pt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => onViewDetails(candidate.resumeId)}
                      >
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="ranking">
            <Trophy className="h-4 w-4 mr-2" /> Ranking
          </TabsTrigger>
          <TabsTrigger value="chart">
            <BarChartIcon className="h-4 w-4 mr-2" /> Charts
          </TabsTrigger>
          <TabsTrigger value="list">
            <List className="h-4 w-4 mr-2" /> List View
          </TabsTrigger>
          <TabsTrigger value="details">
            <FileText className="h-4 w-4 mr-2" /> Job Details
          </TabsTrigger>
        </TabsList>

        {/* Ranking Table Tab */}
        <TabsContent value="ranking">
          <Card>
            <CardHeader>
              <CardTitle>Complete Candidate Ranking</CardTitle>
              <CardDescription>
                All candidates ranked from highest to lowest match score
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16 text-center">Rank</TableHead>
                      <TableHead>Candidate</TableHead>
                      <TableHead className="w-24 text-center">Score</TableHead>
                      <TableHead className="w-32 text-center">Assessment</TableHead>
                      <TableHead className="w-48">Key Matches</TableHead>
                      <TableHead className="w-48">Key Mismatches</TableHead>
                      <TableHead className="w-24 text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {processedResults.map((result, index) => (
                      <TableRow key={result.resumeId}>
                        <TableCell className="text-center font-bold">
                          {index === 0 ? (
                            <div className="flex justify-center">
                              <Trophy className="h-5 w-5 text-yellow-500" />
                            </div>
                          ) : index === 1 ? (
                            <div className="flex justify-center">
                              <Medal className="h-5 w-5 text-gray-400" />
                            </div>
                          ) : index === 2 ? (
                            <div className="flex justify-center">
                              <Award className="h-5 w-5 text-amber-700" />
                            </div>
                          ) : (
                            <span>{index + 1}</span>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-muted-foreground" />
                            {result.candidateName || result.resumeTitle}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            style={{
                              backgroundColor: getScoreColor(result.matchScore),
                              color: 'white'
                            }}
                          >
                            {result.matchScore}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {result.assessment}
                        </TableCell>
                        <TableCell>
                          <ul className="list-disc list-inside text-xs space-y-1">
                            {result.keyMatches.slice(0, 2).map((match, i) => (
                              <li key={i} className="text-muted-foreground truncate">
                                {match}
                              </li>
                            ))}
                            {result.keyMatches.length > 2 && (
                              <li className="text-muted-foreground">
                                +{result.keyMatches.length - 2} more
                              </li>
                            )}
                          </ul>
                        </TableCell>
                        <TableCell>
                          <ul className="list-disc list-inside text-xs space-y-1">
                            {result.keyMismatches.slice(0, 2).map((mismatch, i) => (
                              <li key={i} className="text-muted-foreground truncate">
                                {mismatch}
                              </li>
                            ))}
                            {result.keyMismatches.length > 2 && (
                              <li className="text-muted-foreground">
                                +{result.keyMismatches.length - 2} more
                              </li>
                            )}
                          </ul>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewDetails(result.resumeId)}
                          >
                            <FileText className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chart" className="space-y-6">
          <div className="flex justify-end mb-2">
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <Button
                variant={chartType === 'bar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('bar')}
                className="rounded-l-md rounded-r-none"
              >
                <BarChartIcon className="h-4 w-4 mr-2" /> Bar Chart
              </Button>
              <Button
                variant={chartType === 'pie' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('pie')}
                className="rounded-r-md rounded-l-none"
              >
                <PieChartIcon className="h-4 w-4 mr-2" /> Pie Chart
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                {chartType === 'bar' ? 'Candidate Match Scores' : 'Candidates by Assessment Category'}
              </CardTitle>
              <CardDescription>
                {chartType === 'bar'
                  ? 'Visual representation of each candidate\'s match score'
                  : 'Distribution of candidates by assessment category'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                {chartType === 'bar' ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={barChartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => {
                          // Ensure names are properly formatted
                          if (typeof value === 'string') {
                            // If the name is too long, truncate it
                            return value.length > 15 ? value.substring(0, 15) + '...' : value;
                          }
                          return value;
                        }}
                      />
                      <YAxis domain={[0, 100]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="score"
                        name="Match Score"
                        isAnimationActive={true}
                      >
                        {barChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getScoreColor(entry.score)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{results.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {results.length > 0
                    ? (results.reduce((sum, r) => sum + r.matchScore, 0) / results.length).toFixed(1)
                    : 'N/A'
                  }
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Highest Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" style={{ color: results.length > 0 ? getScoreColor(Math.max(...results.map(r => r.matchScore))) : undefined }}>
                  {results.length > 0 ? Math.max(...results.map(r => r.matchScore)) : 'N/A'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Lowest Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" style={{ color: results.length > 0 ? getScoreColor(Math.min(...results.map(r => r.matchScore))) : undefined }}>
                  {results.length > 0 ? Math.min(...results.map(r => r.matchScore)) : 'N/A'}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Ranked Candidates</CardTitle>
              <CardDescription>
                Candidates ranked by match score ({processedResults.length} shown)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {processedResults.map((result, index) => (
                    <Card key={result.resumeId} className="overflow-hidden">
                      <div className="flex flex-col md:flex-row">
                        <div className="p-4 md:p-6 flex-grow">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold flex items-center">
                                <User className="h-5 w-5 mr-2 text-muted-foreground" />
                                {result.candidateName || result.resumeTitle}
                              </h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                Resume ID: {result.resumeId.substring(0, 8)}...
                              </p>
                            </div>
                            <Badge
                              className="ml-2"
                              style={{
                                backgroundColor: getAssessmentColor(result.assessment),
                                color: 'white'
                              }}
                            >
                              {result.assessment}
                            </Badge>
                          </div>

                          <div className="mt-4">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium">Match Score</span>
                              <span
                                className="text-sm font-bold"
                                style={{ color: getScoreColor(result.matchScore) }}
                              >
                                {result.matchScore}/100
                              </span>
                            </div>
                            <Progress
                              value={result.matchScore}
                              className={cn(
                                "h-2",
                                result.matchScore >= 80 ? "[--progress-foreground:theme(colors.green.500)]" :
                                  result.matchScore >= 70 ? "[--progress-foreground:theme(colors.blue.500)]" :
                                    result.matchScore >= 50 ? "[--progress-foreground:theme(colors.amber.500)]" :
                                      "[--progress-foreground:theme(colors.red.500)]"
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                              <h4 className="text-sm font-medium flex items-center text-green-600">
                                <CheckCircle className="h-4 w-4 mr-1" /> Key Matches
                              </h4>
                              <ul className="mt-1 space-y-1">
                                {result.keyMatches.slice(0, 3).map((match, i) => (
                                  <li key={i} className="text-xs text-muted-foreground">
                                    • {match}
                                  </li>
                                ))}
                                {result.keyMatches.length > 3 && (
                                  <li className="text-xs text-muted-foreground">
                                    • +{result.keyMatches.length - 3} more
                                  </li>
                                )}
                              </ul>
                            </div>

                            <div>
                              <h4 className="text-sm font-medium flex items-center text-red-600">
                                <XCircle className="h-4 w-4 mr-1" /> Key Mismatches
                              </h4>
                              <ul className="mt-1 space-y-1">
                                {result.keyMismatches.slice(0, 3).map((mismatch, i) => (
                                  <li key={i} className="text-xs text-muted-foreground">
                                    • {mismatch}
                                  </li>
                                ))}
                                {result.keyMismatches.length > 3 && (
                                  <li className="text-xs text-muted-foreground">
                                    • +{result.keyMismatches.length - 3} more
                                  </li>
                                )}
                              </ul>
                            </div>
                          </div>

                          <div className="mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onViewDetails(result.resumeId)}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>

                        <div
                          className="w-full md:w-24 h-24 md:h-auto flex items-center justify-center text-4xl font-bold text-white"
                          style={{ backgroundColor: getScoreColor(result.matchScore) }}
                        >
                          {index + 1}
                        </div>
                      </div>
                    </Card>
                  ))}

                  {processedResults.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No candidates match the current filter criteria.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Job Description Details</CardTitle>
              <CardDescription>
                The job description used for matching candidates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  <div className="whitespace-pre-wrap text-sm">
                    {jobDescription}
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}