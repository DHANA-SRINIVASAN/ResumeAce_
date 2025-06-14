// src/components/bulk-resume-upload.tsx
"use client";

import React, { useState, useRef, useCallback } from 'react';
import { UploadCloud, FileText, XCircle, Image as ImageIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BulkResumeUploadProps {
  onUpload: (files: File[]) => Promise<void>;
  isProcessing: boolean;
  maxFiles?: number;
}

const acceptedFileTypes: Record<string, string[]> = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'image/jpeg': ['.jpeg', '.jpg'],
  'image/png': ['.png'],
};
const acceptedFileExtensions = Object.values(acceptedFileTypes).flat().join(',');

export function BulkResumeUpload({ onUpload, isProcessing, maxFiles = 50 }: BulkResumeUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [invalidFiles, setInvalidFiles] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateFile = (file: File): boolean => {
    // Check file type
    if (!acceptedFileTypes[file.type as keyof typeof acceptedFileTypes]) {
      return false;
    }
    
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return false;
    }
    
    return true;
  };

  const handleFileChange = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const newValidFiles: File[] = [];
    const newInvalidFiles: string[] = [];
    
    // Check if adding these files would exceed the maximum
    if (selectedFiles.length + files.length > maxFiles) {
      toast({
        title: "Too Many Files",
        description: `You can upload a maximum of ${maxFiles} files at once.`,
        variant: "destructive",
      });
      return;
    }
    
    Array.from(files).forEach(file => {
      if (validateFile(file)) {
        // Check for duplicates by name
        if (!selectedFiles.some(existingFile => existingFile.name === file.name)) {
          newValidFiles.push(file);
        }
      } else {
        newInvalidFiles.push(`${file.name} (${file.type || 'unknown type'}, ${(file.size / (1024*1024)).toFixed(2)}MB)`);
      }
    });
    
    if (newValidFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...newValidFiles]);
      toast({
        title: "Files Added",
        description: `Added ${newValidFiles.length} resume${newValidFiles.length > 1 ? 's' : ''} to the upload queue.`,
      });
    }
    
    if (newInvalidFiles.length > 0) {
      setInvalidFiles(newInvalidFiles);
      toast({
        title: "Some Files Skipped",
        description: `${newInvalidFiles.length} file${newInvalidFiles.length > 1 ? 's were' : ' was'} invalid and skipped.`,
        variant: "destructive",
      });
    }
    
    // Reset the input
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, [selectedFiles, maxFiles, toast]);

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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files);
    }
  }, [handleFileChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFileChange(e.target.files);
    }
  };

  const onBrowseClick = () => {
    inputRef.current?.click();
  };

  const removeFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const removeAllFiles = useCallback(() => {
    setSelectedFiles([]);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length > 0 && !isProcessing) {
      await onUpload(selectedFiles);
    }
  }, [selectedFiles, isProcessing, onUpload]);

  const clearInvalidFiles = useCallback(() => {
    setInvalidFiles([]);
  }, []);

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4 flex-shrink-0" />;
    }
    return <FileText className="h-4 w-4 flex-shrink-0" />;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-card rounded-xl shadow-lg">
      <div>
        <div
          className={cn(
            "flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
            dragActive ? "border-primary bg-primary/10" : "border-border hover:border-primary/70 hover:bg-accent/5",
            selectedFiles.length > 0 ? "border-primary/50" : ""
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={onBrowseClick}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <UploadCloud className={cn("w-10 h-10 mb-2", dragActive ? "text-primary" : "text-muted-foreground")} />
            <p className={cn("mb-1 text-sm", dragActive ? "text-primary" : "text-muted-foreground")}>
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">
              PDF, DOCX, JPG, PNG (MAX. 5MB per file, {maxFiles} files max)
            </p>
            {selectedFiles.length > 0 && (
              <Badge variant="outline" className="mt-2">
                {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
              </Badge>
            )}
          </div>
          <input
            ref={inputRef}
            id="resume-upload-bulk"
            type="file"
            className="hidden"
            onChange={handleChange}
            accept={acceptedFileExtensions}
            disabled={isProcessing}
            multiple
          />
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium">Selected Resumes ({selectedFiles.length})</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={removeAllFiles} 
              disabled={isProcessing}
              className="text-destructive hover:text-destructive/80 h-8 px-2"
            >
              <XCircle className="h-4 w-4 mr-1" /> Clear All
            </Button>
          </div>
          
          <ScrollArea className="h-40 w-full rounded-md border">
            <div className="p-4 space-y-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between py-1 px-2 rounded-md hover:bg-accent/5">
                  <div className="flex items-center space-x-2 overflow-hidden">
                    {getFileIcon(file)}
                    <span className="text-sm truncate max-w-[200px]" title={file.name}>
                      {file.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({(file.size / 1024).toFixed(0)} KB)
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    disabled={isProcessing}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <XCircle className="h-4 w-4" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {invalidFiles.length > 0 && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Invalid Files Detected</AlertTitle>
          <AlertDescription>
            <p className="mb-2">The following files were skipped due to invalid format or size:</p>
            <ScrollArea className="h-20 w-full">
              <ul className="text-xs space-y-1 list-disc list-inside">
                {invalidFiles.map((file, index) => (
                  <li key={index}>{file}</li>
                ))}
              </ul>
            </ScrollArea>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearInvalidFiles} 
              className="mt-2 bg-destructive/10 hover:bg-destructive/20 text-destructive border-destructive/20"
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {isProcessing && (
        <div className="w-full">
          <Progress value={100} className="h-2 animate-pulse" />
          <p className="text-sm text-center text-primary mt-2">Processing resumes...</p>
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={removeAllFiles} 
          disabled={selectedFiles.length === 0 || isProcessing}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="bg-primary hover:bg-primary/90 text-primary-foreground" 
          disabled={selectedFiles.length === 0 || isProcessing}
        >
          {isProcessing ? 'Processing...' : `Upload ${selectedFiles.length} Resume${selectedFiles.length !== 1 ? 's' : ''}`}
        </Button>
      </div>
    </form>
  );
}