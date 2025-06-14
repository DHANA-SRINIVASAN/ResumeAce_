'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

// Resume section types
type SectionType = 'personal' | 'summary' | 'skills' | 'experience' | 'education' | 'projects' | 'certifications';

interface ResumeSection {
  id: string;
  type: SectionType;
  title: string;
  content: any;
  order: number;
}

export default function InteractiveResumeBuilder({ userId, initialData = null }) {
  const { toast } = useToast();
  const [sections, setSections] = useState<ResumeSection[]>([]);
  const [resumeTitle, setResumeTitle] = useState('My Professional Resume');
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedSection, setDraggedSection] = useState<string | null>(null);

  useEffect(() => {
    // Initialize with default sections if no initial data
    if (!initialData) {
      setSections([
        {
          id: 'personal-info',
          type: 'personal',
          title: 'Personal Information',
          content: { name: '', email: '', phone: '', location: '' },
          order: 0,
        },
        {
          id: 'summary',
          type: 'summary',
          title: 'Professional Summary',
          content: { text: '' },
          order: 1,
        },
        {
          id: 'skills',
          type: 'skills',
          title: 'Skills',
          content: { items: [] },
          order: 2,
        },
        {
          id: 'experience',
          type: 'experience',
          title: 'Work Experience',
          content: { items: [] },
          order: 3,
        },
        {
          id: 'education',
          type: 'education',
          title: 'Education',
          content: { items: [] },
          order: 4,
        },
      ]);
    } else {
      // Load initial data
      setSections(initialData.sections);
      setResumeTitle(initialData.title);
    }
  }, [initialData]);

  const moveSection = (draggedId: string, targetId: string) => {
    const draggedIndex = sections.findIndex(section => section.id === draggedId);
    const targetIndex = sections.findIndex(section => section.id === targetId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;
    
    const newSections = [...sections];
    const [removed] = newSections.splice(draggedIndex, 1);
    newSections.splice(targetIndex, 0, removed);
    
    // Update order values
    const updatedSections = newSections.map((section, idx) => ({
      ...section,
      order: idx,
    }));
    
    setSections(updatedSections);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setIsDragging(true);
    setDraggedSection(id);
    e.dataTransfer.setData('text/plain', id);
    // For better drag preview
    if (e.target instanceof HTMLElement) {
      e.dataTransfer.setDragImage(e.target, 20, 20);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    if (draggedId !== targetId) {
      moveSection(draggedId, targetId);
    }
    setIsDragging(false);
    setDraggedSection(null);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedSection(null);
  };

  const addSection = (type: SectionType) => {
    const newSection: ResumeSection = {
      id: `${type}-${Date.now()}`,
      type,
      title: getDefaultTitle(type),
      content: getDefaultContent(type),
      order: sections.length,
    };
    
    setSections([...sections, newSection]);
    setActiveSection(newSection.id);
    
    toast({
      title: 'Section added',
      description: `${newSection.title} section has been added to your resume.`,
    });
  };

  const removeSection = (id: string) => {
    setSections(sections.filter(section => section.id !== id));
    if (activeSection === id) {
      setActiveSection(null);
    }
    
    toast({
      title: 'Section removed',
      description: 'The section has been removed from your resume.',
    });
  };

  const updateSectionContent = (id: string, content: any) => {
    setSections(sections.map(section => 
      section.id === id ? { ...section, content } : section
    ));
    
    // Generate suggestions based on content
    generateSuggestions(id, content);
  };

  const generateSuggestions = async (sectionId: string, content: any) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;
    
    // In a real implementation, this would call an AI service
    // For now, we'll generate mock suggestions
    if (section.type === 'summary' && content.text) {
      setSuggestions([
        'Consider adding specific achievements with metrics',
        'Mention your years of experience in your field',
        'Include your top technical skills in your summary'
      ]);
    } else if (section.type === 'experience' && content.items.length > 0) {
      setSuggestions([
        'Use action verbs to start your bullet points',
        'Include quantifiable achievements in each role',
        'Ensure your experience aligns with your target job'
      ]);
    } else {
      setSuggestions([]);
    }
  };

  const saveResume = async () => {
    try {
      // Format the resume data
      const resumeData = {
        userId,
        title: resumeTitle,
        content: formatResumeContent(sections),
      };
      
      // Save to API
      const response = await fetch('/api/resumes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resumeData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save resume');
      }
      
      const data = await response.json();
      
      toast({
        title: 'Resume saved',
        description: 'Your resume has been saved successfully.',
      });
      
      return data;
    } catch (error) {
      toast({
        title: 'Error saving resume',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Helper functions
  function getDefaultTitle(type: SectionType): string {
    const titles = {
      personal: 'Personal Information',
      summary: 'Professional Summary',
      skills: 'Skills',
      experience: 'Work Experience',
      education: 'Education',
      projects: 'Projects',
      certifications: 'Certifications',
    };
    return titles[type];
  }

  function getDefaultContent(type: SectionType): any {
    switch (type) {
      case 'personal':
        return { name: '', email: '', phone: '', location: '' };
      case 'summary':
        return { text: '' };
      case 'skills':
        return { items: [] };
      case 'experience':
        return { items: [] };
      case 'education':
        return { items: [] };
      case 'projects':
        return { items: [] };
      case 'certifications':
        return { items: [] };
      default:
        return {};
    }
  }

  function formatResumeContent(sections: ResumeSection[]): any {
    // Transform sections into the format expected by the API
    const sortedSections = [...sections].sort((a, b) => a.order - b.order);
    
    const formatted: any = {
      personal: {},
      summary: '',
      skills: [],
      experience: [],
      education: [],
      projects: [],
      certifications: [],
    };
    
    sortedSections.forEach(section => {
      switch (section.type) {
        case 'personal':
          formatted.personal = section.content;
          break;
        case 'summary':
          formatted.summary = section.content.text;
          break;
        case 'skills':
          formatted.skills = section.content.items;
          break;
        case 'experience':
          formatted.experience = section.content.items;
          break;
        case 'education':
          formatted.education = section.content.items;
          break;
        case 'projects':
          formatted.projects = section.content.items;
          break;
        case 'certifications':
          formatted.certifications = section.content.items;
          break;
      }
    });
    
    return formatted;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>
              <Input
                value={resumeTitle}
                onChange={(e) => setResumeTitle(e.target.value)}
                className="text-xl font-bold"
              />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {sections
                .sort((a, b) => a.order - b.order)
                .map((section) => (
                  <div
                    key={section.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, section.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, section.id)}
                    onDragEnd={handleDragEnd}
                    className={`p-4 border rounded-lg ${
                      isDragging && draggedSection === section.id ? 'opacity-50' : ''
                    } ${activeSection === section.id ? 'border-primary' : ''}`}
                    onClick={() => setActiveSection(section.id)}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">{section.title}</h3>
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); removeSection(section.id); }}>
                        Remove
                      </Button>
                    </div>
                    
                    {activeSection === section.id && (
                      <div className="mt-2">
                        {/* Render different editors based on section type */}
                        {section.type === 'personal' && (
                          <PersonalInfoEditor content={section.content} onChange={(content) => updateSectionContent(section.id, content)} />
                        )}
                        {section.type === 'summary' && (
                          <SummaryEditor content={section.content} onChange={(content) => updateSectionContent(section.id, content)} />
                        )}
                        {section.type === 'skills' && (
                          <SkillsEditor content={section.content} onChange={(content) => updateSectionContent(section.id, content)} />
                        )}
                        {section.type === 'experience' && (
                          <ExperienceEditor content={section.content} onChange={(content) => updateSectionContent(section.id, content)} />
                        )}
                        {section.type === 'education' && (
                          <EducationEditor content={section.content} onChange={(content) => updateSectionContent(section.id, content)} />
                        )}
                        {/* Add other section editors as needed */}
                      </div>
                    )}
                  </div>
                ))}
            </div>
            <div className="mt-6">
              <Button onClick={saveResume} className="w-full">Save Resume</Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Resume Builder</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Add Sections</h3>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => addSection('summary')}>
                    Summary
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => addSection('skills')}>
                    Skills
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => addSection('experience')}>
                    Experience
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => addSection('education')}>
                    Education
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => addSection('projects')}>
                    Projects
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => addSection('certifications')}>
                    Certifications
                  </Button>
                </div>
              </div>
              
              {suggestions.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Suggestions</h3>
                  <ul className="space-y-2">
                    {suggestions.map((suggestion, index) => (
                      <li key={index} className="text-sm p-2 bg-muted rounded-md">
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Section Editors
function PersonalInfoEditor({ content, onChange }) {
  return (
    <div className="space-y-2">
      <div>
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          value={content.name}
          onChange={(e) => onChange({ ...content, name: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={content.email}
          onChange={(e) => onChange({ ...content, email: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          value={content.phone}
          onChange={(e) => onChange({ ...content, phone: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={content.location}
          onChange={(e) => onChange({ ...content, location: e.target.value })}
        />
      </div>
    </div>
  );
}

function SummaryEditor({ content, onChange }) {
  return (
    <div>
      <Label htmlFor="summary">Professional Summary</Label>
      <Textarea
        id="summary"
        value={content.text}
        onChange={(e) => onChange({ ...content, text: e.target.value })}
        rows={4}
      />
    </div>
  );
}

function SkillsEditor({ content, onChange }) {
  const [newSkill, setNewSkill] = useState('');
  
  const addSkill = () => {
    if (newSkill.trim()) {
      onChange({ items: [...content.items, newSkill.trim()] });
      setNewSkill('');
    }
  };
  
  const removeSkill = (index: number) => {
    const newItems = [...content.items];
    newItems.splice(index, 1);
    onChange({ items: newItems });
  };
  
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          placeholder="Add a skill"
          onKeyDown={(e) => e.key === 'Enter' && addSkill()}
        />
        <Button onClick={addSkill}>Add</Button>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {content.items.map((skill, index) => (
          <div key={index} className="flex items-center bg-muted px-3 py-1 rounded-full text-sm">
            {skill}
            <button
              onClick={() => removeSkill(index)}
              className="ml-2 text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExperienceEditor({ content, onChange }) {
  const [showForm, setShowForm] = useState(false);
  const [currentItem, setCurrentItem] = useState({
    company: '',
    role: '',
    startDate: '',
    endDate: '',
    description: '',
  });
  const [editIndex, setEditIndex] = useState(-1);
  
  const saveItem = () => {
    const newItems = [...content.items];
    if (editIndex >= 0) {
      newItems[editIndex] = currentItem;
    } else {
      newItems.push(currentItem);
    }
    onChange({ items: newItems });
    resetForm();
  };
  
  const editItem = (index: number) => {
    setCurrentItem(content.items[index]);
    setEditIndex(index);
    setShowForm(true);
  };
  
  const removeItem = (index: number) => {
    const newItems = [...content.items];
    newItems.splice(index, 1);
    onChange({ items: newItems });
  };
  
  const resetForm = () => {
    setCurrentItem({
      company: '',
      role: '',
      startDate: '',
      endDate: '',
      description: '',
    });
    setEditIndex(-1);
    setShowForm(false);
  };
  
  return (
    <div className="space-y-4">
      {content.items.map((item, index) => (
        <div key={index} className="p-3 border rounded-md">
          <div className="flex justify-between">
            <div>
              <h4 className="font-medium">{item.role}</h4>
              <p className="text-sm text-muted-foreground">{item.company}</p>
              <p className="text-xs">
                {item.startDate} - {item.endDate || 'Present'}
              </p>
            </div>
            <div>
              <Button variant="ghost" size="sm" onClick={() => editItem(index)}>
                Edit
              </Button>
              <Button variant="ghost" size="sm" onClick={() => removeItem(index)}>
                Remove
              </Button>
            </div>
          </div>
          <p className="mt-2 text-sm">{item.description}</p>
        </div>
      ))}
      
      {showForm ? (
        <div className="border p-3 rounded-md space-y-2">
          <div>
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              value={currentItem.company}
              onChange={(e) => setCurrentItem({ ...currentItem, company: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <Input
              id="role"
              value={currentItem.role}
              onChange={(e) => setCurrentItem({ ...currentItem, role: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={currentItem.startDate}
                onChange={(e) => setCurrentItem({ ...currentItem, startDate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={currentItem.endDate}
                onChange={(e) => setCurrentItem({ ...currentItem, endDate: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={currentItem.description}
              onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button onClick={saveItem}>
              {editIndex >= 0 ? 'Update' : 'Add'} Experience
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" onClick={() => setShowForm(true)}>
          Add Experience
        </Button>
      )}
    </div>
  );
}

function EducationEditor({ content, onChange }) {
  const [showForm, setShowForm] = useState(false);
  const [currentItem, setCurrentItem] = useState({
    institution: '',
    degree: '',
    field: '',
    startDate: '',
    endDate: '',
    description: '',
  });
  const [editIndex, setEditIndex] = useState(-1);
  
  const saveItem = () => {
    const newItems = [...content.items];
    if (editIndex >= 0) {
      newItems[editIndex] = currentItem;
    } else {
      newItems.push(currentItem);
    }
    onChange({ items: newItems });
    resetForm();
  };
  
  const editItem = (index: number) => {
    setCurrentItem(content.items[index]);
    setEditIndex(index);
    setShowForm(true);
  };
  
  const removeItem = (index: number) => {
    const newItems = [...content.items];
    newItems.splice(index, 1);
    onChange({ items: newItems });
  };
  
  const resetForm = () => {
    setCurrentItem({
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      description: '',
    });
    setEditIndex(-1);
    setShowForm(false);
  };
  
  return (
    <div className="space-y-4">
      {content.items.map((item, index) => (
        <div key={index} className="p-3 border rounded-md">
          <div className="flex justify-between">
            <div>
              <h4 className="font-medium">{item.degree} in {item.field}</h4>
              <p className="text-sm text-muted-foreground">{item.institution}</p>
              <p className="text-xs">
                {item.startDate} - {item.endDate || 'Present'}
              </p>
            </div>
            <div>
              <Button variant="ghost" size="sm" onClick={() => editItem(index)}>
                Edit
              </Button>
              <Button variant="ghost" size="sm" onClick={() => removeItem(index)}>
                Remove
              </Button>
            </div>
          </div>
          {item.description && <p className="mt-2 text-sm">{item.description}</p>}
        </div>
      ))}
      
      {showForm ? (
        <div className="border p-3 rounded-md space-y-2">
          <div>
            <Label htmlFor="institution">Institution</Label>
            <Input
              id="institution"
              value={currentItem.institution}
              onChange={(e) => setCurrentItem({ ...currentItem, institution: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="degree">Degree</Label>
            <Input
              id="degree"
              value={currentItem.degree}
              onChange={(e) => setCurrentItem({ ...currentItem, degree: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="field">Field of Study</Label>
            <Input
              id="field"
              value={currentItem.field}
              onChange={(e) => setCurrentItem({ ...currentItem, field: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="eduStartDate">Start Date</Label>
              <Input
                id="eduStartDate"
                type="date"
                value={currentItem.startDate}
                onChange={(e) => setCurrentItem({ ...currentItem, startDate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="eduEndDate">End Date</Label>
              <Input
                id="eduEndDate"
                type="date"
                value={currentItem.endDate}
                onChange={(e) => setCurrentItem({ ...currentItem, endDate: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="eduDescription">Description (Optional)</Label>
            <Textarea
              id="eduDescription"
              value={currentItem.description}
              onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button onClick={saveItem}>
              {editIndex >= 0 ? 'Update' : 'Add'} Education
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" onClick={() => setShowForm(true)}>
          Add Education
        </Button>
      )}
    </div>
  );
}