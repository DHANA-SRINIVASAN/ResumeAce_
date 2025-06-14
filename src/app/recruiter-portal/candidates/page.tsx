"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { AuthGuard } from '@/components/auth-guard';
import {
  Users,
  UserPlus,
  Search,
  Tag,
  FileText,
  Trash2,
  Edit,
  Plus,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Target,
  ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LoadingIndicator } from '@/components/loading-indicator';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { BulkResumeUpload } from '@/components/bulk-resume-upload';

// Types
interface Candidate {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
  resumes: {
    id: string;
    title: string;
    fileName: string;
    createdAt: string;
  }[];
  tags: {
    id: string;
    name: string;
    color: string | null;
  }[];
  _count: {
    notes: number;
    matches: number;
  };
}

interface CandidateNote {
  id: string;
  content: string;
  createdAt: string;
  candidateId: string;
}

function CandidateManagementContent() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<{ name: string, color: string }[]>([]);
  const [isAddingCandidate, setIsAddingCandidate] = useState(false);
  const [isUploadingResumes, setIsUploadingResumes] = useState(false);
  const [newCandidateData, setNewCandidateData] = useState({
    name: '',
    email: '',
    phone: '',
    tags: [] as string[],
  });
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [candidateNotes, setCandidateNotes] = useState<CandidateNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isViewingCandidate, setIsViewingCandidate] = useState(false);
  const [isEditingCandidate, setIsEditingCandidate] = useState(false);
  const [isDeletingCandidate, setIsDeletingCandidate] = useState(false);
  const [newTag, setNewTag] = useState('');

  const { toast } = useToast();

  // Fetch candidates
  const fetchCandidates = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/candidates');

      if (!response.ok) {
        throw new Error('Failed to fetch candidates');
      }

      const data = await response.json();
      setCandidates(data);
      setFilteredCandidates(data);

      // Extract all unique tags
      const tags = data.flatMap((candidate: Candidate) =>
        candidate.tags.map((tag: { id: string, name: string, color: string | null }) => ({ name: tag.name, color: tag.color || '#888888' }))
      );

      // Remove duplicates
      const uniqueTags = Array.from(new Map(tags.map((tag: { name: string, color: string }) => [tag.name, tag])).values()) as { name: string, color: string }[];
      setAllTags(uniqueTags);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load candidates',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Fetch candidate notes
  const fetchCandidateNotes = useCallback(async (candidateId: string) => {
    try {
      const response = await fetch(`/api/candidates/${candidateId}/notes`);

      if (!response.ok) {
        throw new Error('Failed to fetch candidate notes');
      }

      const data = await response.json();
      setCandidateNotes(data);
    } catch (error) {
      console.error('Error fetching candidate notes:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load candidate notes',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Add a new candidate
  const addCandidate = useCallback(async () => {
    try {
      setIsAddingCandidate(true);

      if (!newCandidateData.name.trim()) {
        toast({
          title: 'Error',
          description: 'Candidate name is required',
          variant: 'destructive',
        });
        return;
      }

      const response = await fetch('/api/candidates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCandidateData),
      });

      if (!response.ok) {
        throw new Error('Failed to add candidate');
      }

      const data = await response.json();

      setCandidates(prev => [data, ...prev]);
      setFilteredCandidates(prev => [data, ...prev]);

      toast({
        title: 'Success',
        description: 'Candidate added successfully',
      });

      // Reset form
      setNewCandidateData({
        name: '',
        email: '',
        phone: '',
        tags: [],
      });

      // Close dialog
      setIsAddingCandidate(false);
    } catch (error) {
      console.error('Error adding candidate:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add candidate',
        variant: 'destructive',
      });
    } finally {
      setIsAddingCandidate(false);
    }
  }, [newCandidateData, toast]);

  // Update a candidate
  const updateCandidate = useCallback(async () => {
    if (!selectedCandidate) return;

    try {
      setIsEditingCandidate(true);

      if (!newCandidateData.name.trim()) {
        toast({
          title: 'Error',
          description: 'Candidate name is required',
          variant: 'destructive',
        });
        return;
      }

      const response = await fetch(`/api/candidates/${selectedCandidate.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCandidateData),
      });

      if (!response.ok) {
        throw new Error('Failed to update candidate');
      }

      const data = await response.json();

      setCandidates(prev =>
        prev.map(candidate =>
          candidate.id === selectedCandidate.id ? data : candidate
        )
      );
      setFilteredCandidates(prev =>
        prev.map(candidate =>
          candidate.id === selectedCandidate.id ? data : candidate
        )
      );

      toast({
        title: 'Success',
        description: 'Candidate updated successfully',
      });

      // Close dialog
      setIsEditingCandidate(false);
      setSelectedCandidate(data);

      // Extract all unique tags again
      const tags = candidates.flatMap((candidate: Candidate) =>
        candidate.tags.map((tag: { id: string, name: string, color: string | null }) => ({ name: tag.name, color: tag.color || '#888888' }))
      );

      // Remove duplicates
      const uniqueTags = Array.from(new Map(tags.map((tag: { name: string, color: string }) => [tag.name, tag])).values()) as { name: string, color: string }[];
      setAllTags(uniqueTags);
    } catch (error) {
      console.error('Error updating candidate:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update candidate',
        variant: 'destructive',
      });
    } finally {
      setIsEditingCandidate(false);
    }
  }, [selectedCandidate, newCandidateData, candidates, toast]);

  // Delete a candidate
  const deleteCandidate = useCallback(async () => {
    if (!selectedCandidate) return;

    try {
      setIsDeletingCandidate(true);

      const response = await fetch(`/api/candidates/${selectedCandidate.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete candidate');
      }

      setCandidates(prev =>
        prev.filter(candidate => candidate.id !== selectedCandidate.id)
      );
      setFilteredCandidates(prev =>
        prev.filter(candidate => candidate.id !== selectedCandidate.id)
      );

      toast({
        title: 'Success',
        description: 'Candidate deleted successfully',
      });

      // Close dialogs
      setIsDeletingCandidate(false);
      setIsViewingCandidate(false);
      setSelectedCandidate(null);
    } catch (error) {
      console.error('Error deleting candidate:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete candidate',
        variant: 'destructive',
      });
    } finally {
      setIsDeletingCandidate(false);
    }
  }, [selectedCandidate, toast]);

  // Add a note to a candidate
  const addNote = useCallback(async () => {
    if (!selectedCandidate) return;

    try {
      setIsAddingNote(true);

      if (!newNote.trim()) {
        toast({
          title: 'Error',
          description: 'Note content is required',
          variant: 'destructive',
        });
        return;
      }

      const response = await fetch(`/api/candidates/${selectedCandidate.id}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newNote }),
      });

      if (!response.ok) {
        throw new Error('Failed to add note');
      }

      const data = await response.json();

      setCandidateNotes(prev => [data, ...prev]);

      // Update the note count in the candidate
      setCandidates(prev =>
        prev.map(candidate =>
          candidate.id === selectedCandidate.id
            ? {
              ...candidate,
              _count: {
                ...candidate._count,
                notes: candidate._count.notes + 1
              }
            }
            : candidate
        )
      );
      setFilteredCandidates(prev =>
        prev.map(candidate =>
          candidate.id === selectedCandidate.id
            ? {
              ...candidate,
              _count: {
                ...candidate._count,
                notes: candidate._count.notes + 1
              }
            }
            : candidate
        )
      );

      toast({
        title: 'Success',
        description: 'Note added successfully',
      });

      // Reset form
      setNewNote('');
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add note',
        variant: 'destructive',
      });
    } finally {
      setIsAddingNote(false);
    }
  }, [selectedCandidate, newNote, toast]);

  // Handle bulk resume upload
  const handleBulkResumeUpload = useCallback(async (files: File[]) => {
    try {
      setIsUploadingResumes(true);

      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('/api/resumes/batch', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload resumes');
      }

      const data = await response.json();

      if (data.success) {
        // Refresh the candidate list
        fetchCandidates();

        toast({
          title: 'Success',
          description: data.message,
        });
      } else {
        toast({
          title: 'Partial Success',
          description: `${data.message}. Some files could not be processed.`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error uploading resumes:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload resumes',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingResumes(false);
    }
  }, [fetchCandidates, toast]);

  // Filter candidates based on search query and selected tags
  useEffect(() => {
    let filtered = candidates;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(candidate =>
        candidate.name.toLowerCase().includes(query) ||
        (candidate.email && candidate.email.toLowerCase().includes(query)) ||
        (candidate.phone && candidate.phone.toLowerCase().includes(query))
      );
    }

    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(candidate =>
        selectedTags.every(tag =>
          candidate.tags.some(candidateTag => candidateTag.name === tag)
        )
      );
    }

    setFilteredCandidates(filtered);
  }, [candidates, searchQuery, selectedTags]);

  // Load candidates on mount
  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  // Load candidate notes when a candidate is selected
  useEffect(() => {
    if (selectedCandidate) {
      fetchCandidateNotes(selectedCandidate.id);
    }
  }, [selectedCandidate, fetchCandidateNotes]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Handle tag selection
  const toggleTagSelection = (tagName: string) => {
    setSelectedTags(prev =>
      prev.includes(tagName)
        ? prev.filter(tag => tag !== tagName)
        : [...prev, tagName]
    );
  };

  // Handle adding a tag to a new candidate
  const addTagToNewCandidate = () => {
    if (!newTag.trim()) return;

    if (newCandidateData.tags.includes(newTag)) {
      toast({
        title: 'Error',
        description: 'Tag already exists',
        variant: 'destructive',
      });
      return;
    }

    setNewCandidateData(prev => ({
      ...prev,
      tags: [...prev.tags, newTag],
    }));

    setNewTag('');
  };

  // Handle removing a tag from a new candidate
  const removeTagFromNewCandidate = (tag: string) => {
    setNewCandidateData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
  };

  // Handle viewing a candidate
  const viewCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsViewingCandidate(true);
  };

  // Handle editing a candidate
  const editCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setNewCandidateData({
      name: candidate.name,
      email: candidate.email || '',
      phone: candidate.phone || '',
      tags: candidate.tags.map(tag => tag.name),
    });
    setIsEditingCandidate(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-background py-10">
      <div className="container mx-auto px-4">
        <header className="mb-12 pt-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center bg-primary/10 text-primary p-4 rounded-full shadow-lg mb-6 ring-4 ring-primary/20">
              <Users className="w-12 h-12" />
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary">
              Candidate Management
            </h1>
            <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Organize, track, and evaluate candidates efficiently with our comprehensive management system.
            </p>
            <div className="mt-6 flex justify-center space-x-4">
              <Link href="/recruiter-portal">
                <Button variant="outline" size="lg" className="group">
                  <ChevronLeft className="mr-2 h-5 w-5 text-primary" />
                  Back to Recruiter Portal
                </Button>
              </Link>
              <Link href="/recruiter-portal/enhanced">
                <Button variant="outline" size="lg" className="group">
                  <Target className="mr-2 h-5 w-5 text-primary group-hover:animate-pulse" />
                  Enhanced Matching
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <Card className="md:col-span-2 shadow-xl bg-card/80 backdrop-blur-sm border border-primary/10">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center text-2xl text-primary">
                  <Search className="mr-3 h-6 w-6" /> Search Candidates
                </CardTitle>
                <div className="flex space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" /> Filter
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Filter Candidates</DialogTitle>
                        <DialogDescription>
                          Select tags to filter candidates by.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          {allTags.map(tag => (
                            <Badge
                              key={tag.name}
                              variant={selectedTags.includes(tag.name) ? "default" : "outline"}
                              className="cursor-pointer"
                              style={{ backgroundColor: selectedTags.includes(tag.name) ? tag.color : 'transparent', borderColor: tag.color }}
                              onClick={() => toggleTagSelection(tag.name)}
                            >
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                        {selectedTags.length > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">
                              {selectedTags.length} tag{selectedTags.length !== 1 ? 's' : ''} selected
                            </span>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedTags([])}>
                              Clear All
                            </Button>
                          </div>
                        )}
                      </div>
                      <DialogFooter>
                        <Button onClick={() => { }}>Apply Filters</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" size="sm" onClick={fetchCandidates}>
                    <RefreshCw className="h-4 w-4 mr-2" /> Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />

                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <LoadingIndicator text="Loading candidates..." />
                  </div>
                ) : filteredCandidates.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <p className="text-muted-foreground">No candidates found</p>
                    {(searchQuery || selectedTags.length > 0) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedTags([]);
                        }}
                        className="mt-2"
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground mb-2">
                      Showing {filteredCandidates.length} of {candidates.length} candidates
                    </div>
                    <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                      {filteredCandidates.map(candidate => (
                        <Card
                          key={candidate.id}
                          className="p-4 hover:bg-accent/5 cursor-pointer transition-colors"
                          onClick={() => viewCandidate(candidate)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-lg">{candidate.name}</h3>
                              {candidate.email && (
                                <p className="text-sm text-muted-foreground">{candidate.email}</p>
                              )}
                              <div className="flex flex-wrap gap-1 mt-2">
                                {candidate.tags.map(tag => (
                                  <Badge
                                    key={tag.id}
                                    variant="outline"
                                    style={{ borderColor: tag.color || '#888888' }}
                                    className="text-xs"
                                  >
                                    {tag.name}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center text-xs text-muted-foreground mb-1">
                                <FileText className="h-3 w-3 mr-1" />
                                {candidate._count.notes} note{candidate._count.notes !== 1 ? 's' : ''}
                              </div>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <FileText className="h-3 w-3 mr-1" />
                                {candidate.resumes.length} resume{candidate.resumes.length !== 1 ? 's' : ''}
                              </div>
                              <p className="text-xs text-muted-foreground mt-2">
                                Added {formatDate(candidate.createdAt)}
                              </p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="shadow-xl bg-card/80 backdrop-blur-sm border border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center text-xl text-primary">
                  <UserPlus className="mr-3 h-6 w-6" /> Add Candidate
                </CardTitle>
                <CardDescription>
                  Add a new candidate to your database.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={isAddingCandidate} onOpenChange={setIsAddingCandidate}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <UserPlus className="h-4 w-4 mr-2" /> Add New Candidate
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Candidate</DialogTitle>
                      <DialogDescription>
                        Enter the candidate's information below.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                          id="name"
                          placeholder="Full Name"
                          value={newCandidateData.name}
                          onChange={(e) => setNewCandidateData(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Email Address"
                          value={newCandidateData.email}
                          onChange={(e) => setNewCandidateData(prev => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          placeholder="Phone Number"
                          value={newCandidateData.phone}
                          onChange={(e) => setNewCandidateData(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tags">Tags</Label>
                        <div className="flex space-x-2">
                          <Input
                            id="tags"
                            placeholder="Add a tag"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                          />
                          <Button type="button" variant="outline" onClick={addTagToNewCandidate}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        {newCandidateData.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {newCandidateData.tags.map(tag => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="flex items-center gap-1"
                              >
                                {tag}
                                <button
                                  onClick={() => removeTagFromNewCandidate(tag)}
                                  className="text-xs rounded-full hover:bg-destructive/20 p-0.5"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddingCandidate(false)}>
                        Cancel
                      </Button>
                      <Button onClick={addCandidate} disabled={!newCandidateData.name.trim()}>
                        {isAddingCandidate ? <LoadingIndicator size="sm" /> : 'Add Candidate'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            <Card className="shadow-xl bg-card/80 backdrop-blur-sm border border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center text-xl text-primary">
                  <Upload className="mr-3 h-6 w-6" /> Bulk Upload
                </CardTitle>
                <CardDescription>
                  Upload multiple resumes at once to create candidates.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Upload className="h-4 w-4 mr-2" /> Batch Upload Resumes
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>Bulk Resume Upload</DialogTitle>
                      <DialogDescription>
                        Upload multiple resumes to automatically create candidates.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <BulkResumeUpload
                        onUpload={handleBulkResumeUpload}
                        isProcessing={isUploadingResumes}
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            <Card className="shadow-xl bg-card/80 backdrop-blur-sm border border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center text-xl text-primary">
                  <Download className="mr-3 h-6 w-6" /> Export
                </CardTitle>
                <CardDescription>
                  Export your candidate database.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" disabled>
                  <Download className="h-4 w-4 mr-2" /> Export Candidates (CSV)
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Candidate Details Dialog */}
        <Dialog open={isViewingCandidate} onOpenChange={setIsViewingCandidate}>
          <DialogContent className="max-w-4xl">
            {selectedCandidate && (
              <>
                <DialogHeader>
                  <div className="flex justify-between items-center">
                    <DialogTitle className="text-2xl">{selectedCandidate.name}</DialogTitle>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => editCandidate(selectedCandidate)}>
                        <Edit className="h-4 w-4 mr-2" /> Edit
                      </Button>
                      <Dialog open={isDeletingCandidate} onOpenChange={setIsDeletingCandidate}>
                        <DialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Candidate</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete this candidate? This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <Alert variant="destructive">
                              <AlertTitle>Warning</AlertTitle>
                              <AlertDescription>
                                Deleting this candidate will also delete all associated resumes, notes, and matches.
                              </AlertDescription>
                            </Alert>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDeletingCandidate(false)}>
                              Cancel
                            </Button>
                            <Button variant="destructive" onClick={deleteCandidate}>
                              {isDeletingCandidate ? <LoadingIndicator size="sm" /> : 'Delete Candidate'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedCandidate.tags.map(tag => (
                      <Badge
                        key={tag.id}
                        variant="outline"
                        style={{ borderColor: tag.color || '#888888' }}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground mt-2">
                    {selectedCandidate.email && (
                      <div className="flex items-center">
                        <span className="font-medium mr-1">Email:</span> {selectedCandidate.email}
                      </div>
                    )}
                    {selectedCandidate.email && selectedCandidate.phone && (
                      <span className="hidden sm:inline mx-2">•</span>
                    )}
                    {selectedCandidate.phone && (
                      <div className="flex items-center">
                        <span className="font-medium mr-1">Phone:</span> {selectedCandidate.phone}
                      </div>
                    )}
                  </div>
                </DialogHeader>

                <Tabs defaultValue="resumes" className="mt-4">
                  <TabsList className="grid grid-cols-3 w-full">
                    <TabsTrigger value="resumes">
                      <FileText className="h-4 w-4 mr-2" /> Resumes ({selectedCandidate.resumes.length})
                    </TabsTrigger>
                    <TabsTrigger value="notes">
                      <FileText className="h-4 w-4 mr-2" /> Notes ({candidateNotes.length})
                    </TabsTrigger>
                    <TabsTrigger value="matches">
                      <Target className="h-4 w-4 mr-2" /> Job Matches ({selectedCandidate._count.matches})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="resumes" className="space-y-4 mt-4">
                    {selectedCandidate.resumes.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                        <p className="text-muted-foreground">No resumes found</p>
                        <Button variant="outline" size="sm" className="mt-4">
                          <Upload className="h-4 w-4 mr-2" /> Upload Resume
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-medium">Resume History</h3>
                          <Button variant="outline" size="sm">
                            <Upload className="h-4 w-4 mr-2" /> Upload New Resume
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {selectedCandidate.resumes.map(resume => (
                            <Card key={resume.id} className="p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium">{resume.title}</h4>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Uploaded on {formatDate(resume.createdAt)}
                                  </p>
                                </div>
                                <div className="flex space-x-2">
                                  <Button variant="outline" size="sm">
                                    <FileText className="h-4 w-4 mr-2" /> View
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <Target className="h-4 w-4 mr-2" /> Match to Job
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="notes" className="space-y-4 mt-4">
                    <div className="space-y-4">
                      <div className="flex flex-col space-y-2">
                        <Label htmlFor="new-note">Add a Note</Label>
                        <Textarea
                          id="new-note"
                          placeholder="Enter a note about this candidate..."
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          rows={3}
                        />
                        <Button
                          onClick={addNote}
                          disabled={isAddingNote || !newNote.trim()}
                          className="self-end mt-2"
                        >
                          {isAddingNote ? <LoadingIndicator size="sm" /> : 'Add Note'}
                        </Button>
                      </div>

                      {candidateNotes.length === 0 ? (
                        <div className="text-center py-8">
                          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                          <p className="text-muted-foreground">No notes found</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Notes History</h3>
                          <div className="space-y-4">
                            {candidateNotes.map(note => (
                              <Card key={note.id} className="p-4">
                                <p className="whitespace-pre-wrap">{note.content}</p>
                                <p className="text-xs text-muted-foreground mt-2">
                                  Added on {formatDate(note.createdAt)}
                                </p>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="matches" className="space-y-4 mt-4">
                    {selectedCandidate._count.matches === 0 ? (
                      <div className="text-center py-8">
                        <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                        <p className="text-muted-foreground">No job matches found</p>
                        <Button variant="outline" size="sm" className="mt-4">
                          <Target className="h-4 w-4 mr-2" /> Match to Job
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">Job matches will be displayed here</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Candidate Dialog */}
        <Dialog open={isEditingCandidate} onOpenChange={setIsEditingCandidate}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Candidate</DialogTitle>
              <DialogDescription>
                Update the candidate's information.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  placeholder="Full Name"
                  value={newCandidateData.name}
                  onChange={(e) => setNewCandidateData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  placeholder="Email Address"
                  value={newCandidateData.email}
                  onChange={(e) => setNewCandidateData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  placeholder="Phone Number"
                  value={newCandidateData.phone}
                  onChange={(e) => setNewCandidateData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-tags">Tags</Label>
                <div className="flex space-x-2">
                  <Input
                    id="edit-tags"
                    placeholder="Add a tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                  />
                  <Button type="button" variant="outline" onClick={addTagToNewCandidate}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {newCandidateData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newCandidateData.tags.map(tag => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {tag}
                        <button
                          onClick={() => removeTagFromNewCandidate(tag)}
                          className="text-xs rounded-full hover:bg-destructive/20 p-0.5"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditingCandidate(false)}>
                Cancel
              </Button>
              <Button onClick={updateCandidate} disabled={!newCandidateData.name.trim()}>
                {isEditingCandidate ? <LoadingIndicator size="sm" /> : 'Update Candidate'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default function CandidateManagementPage() {
  return (
    <AuthGuard>
      <CandidateManagementContent />
    </AuthGuard>
  );
}