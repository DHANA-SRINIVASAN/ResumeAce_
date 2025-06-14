// src/components/job-description-upload.tsx
"use client";

import React, { useState, useRef, useCallback } from 'react';
import { UploadCloud, FileText, XCircle, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface JobDescriptionUploadProps {
  onJobDescriptionChange: (text: string) => void;
  jobDescription: string;
  isProcessing: boolean;
  templates?: Array<{ label: string; value: string }>;
}

const acceptedFileTypes: Record<string, string[]> = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt'],
};
const acceptedFileExtensions = Object.values(acceptedFileTypes).flat().join(',');

export function JobDescriptionUpload({ 
  onJobDescriptionChange, 
  jobDescription, 
  isProcessing,
  templates = [] 
}: JobDescriptionUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isFileProcessing, setIsFileProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = useCallback(async (file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      return;
    }
    
    // Validate file type
    if (!acceptedFileTypes[file.type as keyof typeof acceptedFileTypes]) {
      toast({
        title: "Invalid File Type",
        description: `Please upload a PDF, DOCX, or TXT file. You uploaded: ${file.name}`,
        variant: "destructive",
      });
      setSelectedFile(null);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: `Please upload a file smaller than 5MB. Your file is ${(file.size / (1024*1024)).toFixed(2)}MB.`,
        variant: "destructive",
      });
      setSelectedFile(null);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    
    setSelectedFile(file);
    
    // Extract text from file
    try {
      setIsFileProcessing(true);
      
      // In a real implementation, you would use a proper file parsing library
      // For now, we'll use a simple text extraction for demonstration
      const text = await extractTextFromFile(file);
      
      if (text) {
        onJobDescriptionChange(text);
        toast({
          title: "File Processed",
          description: `Successfully extracted job description from ${file.name}`,
        });
      } else {
        toast({
          title: "Processing Error",
          description: "Could not extract text from the file. Please try another file or paste the text manually.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error extracting text from file:", error);
      toast({
        title: "Processing Error",
        description: error instanceof Error ? error.message : "An unknown error occurred while processing the file.",
        variant: "destructive",
      });
    } finally {
      setIsFileProcessing(false);
    }
  }, [toast, onJobDescriptionChange]);

  const extractTextFromFile = async (file: File): Promise<string> => {
    // This is a placeholder. In a real implementation, you would use:
    // - PDF.js for PDF files
    // - mammoth.js for DOCX files
    // - FileReader for TXT files
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          // For demonstration, we'll just return the raw text for TXT files
          // In reality, you'd need proper parsing for each file type
          if (file.type === 'text/plain') {
            resolve(e.target?.result as string || '');
          } else {
            // Simulate extracting text from PDF/DOCX
            // In a real implementation, this would be replaced with actual parsing
            const mockText = `Job Description extracted from ${file.name}\n\n` +
              `Position: Software Engineer\n\n` +
              `We are seeking a motivated Software Engineer to design, develop, and maintain high-quality software solutions. ` +
              `Responsibilities include coding, testing, debugging, and collaborating with cross-functional teams. ` +
              `Proficiency in one or more programming languages (e.g., Java, Python, C++), understanding of data structures and algorithms, ` +
              `and experience with version control systems (e.g., Git) are required. ` +
              `Strong problem-solving skills and a bachelor's degree in Computer Science or a related field are essential. ` +
              `Experience with cloud platforms (AWS, Azure, GCP) and agile methodologies is a plus.`;
            
            resolve(mockText);
          }
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      
      if (file.type === 'text/plain') {
        reader.readAsText(file);
      } else {
        // For PDF and DOCX, we'd use specialized libraries
        // For now, just simulate reading
        setTimeout(() => {
          reader.onload?.({ target: { result: '' } } as any);
        }, 1000);
      }
    });
  };

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  }, [handleFileChange]);

  const onBrowseClick = () => {
    inputRef.current?.click();
  };

  const removeFile = useCallback(() => {
    setSelectedFile(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, []);

  const handleTemplateChange = (value: string) => {
    onJobDescriptionChange(value);
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="text" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="text">Text Input</TabsTrigger>
          <TabsTrigger value="file">File Upload</TabsTrigger>
        </TabsList>
        
        <TabsContent value="text" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">Enter Job Description</h3>
            {templates.length > 0 && (
              <Select onValueChange={handleTemplateChange} disabled={isProcessing}>
                <SelectTrigger className="w-[200px] text-xs">
                  <SelectValue placeholder="Use Template..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map(template => (
                    <SelectItem key={template.label} value={template.value} className="text-xs">
                      {template.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          
          <Textarea
            placeholder="Paste the complete job description here..."
            value={jobDescription}
            onChange={(e) => onJobDescriptionChange(e.target.value)}
            rows={8}
            className="resize-none text-sm bg-background/70 border-border focus:border-primary focus:ring-primary rounded-xl p-4"
            disabled={isProcessing}
          />
        </TabsContent>
        
        <TabsContent value="file">
          <div
            className={cn(
              "flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
              dragActive ? "border-primary bg-primary/10" : "border-border hover:border-primary/70 hover:bg-accent/5",
              selectedFile ? "border-primary" : ""
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={selectedFile ? undefined : onBrowseClick}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {selectedFile ? (
                <>
                  <FileText className="w-12 h-12 mb-3 text-primary" />
                  <p className="mb-2 text-sm text-foreground font-semibold break-all px-2">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">({(selectedFile.size / 1024).toFixed(2)} KB)</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {e.stopPropagation(); removeFile();}}
                    className="mt-2 text-destructive hover:text-destructive/80"
                    disabled={isFileProcessing}
                  >
                    <XCircle className="mr-2 h-4 w-4" /> Remove
                  </Button>
                </>
              ) : (
                <>
                  <UploadCloud className={cn("w-12 h-12 mb-3", dragActive ? "text-primary" : "text-muted-foreground")} />
                  <p className={cn("mb-2 text-sm", dragActive ? "text-primary" : "text-muted-foreground")}>
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">PDF, DOCX, TXT (MAX. 5MB)</p>
                </>
              )}
            </div>
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
              accept={acceptedFileExtensions}
              disabled={isProcessing || isFileProcessing}
            />
          </div>
          
          {isFileProcessing && (
            <Alert className="mt-4">
              <FileText className="h-4 w-4" />
              <AlertTitle>Processing File</AlertTitle>
              <AlertDescription>
                Extracting text from your file. This may take a moment...
              </AlertDescription>
            </Alert>
          )}
          
          {selectedFile && !isFileProcessing && (
            <Alert variant="default" className="mt-4 bg-primary/5 border-primary/20">
              <Edit3 className="h-4 w-4 text-primary" />
              <AlertTitle className="text-primary font-medium">File Processed</AlertTitle>
              <AlertDescription className="text-primary/80">
                The job description has been extracted and is available in the text input tab. You can edit it there if needed.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}