"use client";

import React, { useState, useRef, useCallback } from 'react';
import { UploadCloud, FileText, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress'; // Will be used thematically
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ResumeUploadFormProps {
  onAnalyze: (file: File) => Promise<void>;
  isProcessing: boolean;
}

const acceptedFileTypes = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
};
const acceptedFileExtensions = Object.values(acceptedFileTypes).flat().join(',');


export function ResumeUploadForm({ onAnalyze, isProcessing }: ResumeUploadFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (file: File | null) => {
    if (file) {
      if (!acceptedFileTypes[file.type as keyof typeof acceptedFileTypes]) {
        toast({
          title: "Invalid File Type",
          description: `Please upload a PDF or DOCX file. You uploaded: ${file.name}`,
          variant: "destructive",
        });
        setSelectedFile(null);
        return;
      }
      // Optional: Add file size check here
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }
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
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  const onBrowseClick = () => {
    inputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile && !isProcessing) {
      await onAnalyze(selectedFile);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if(inputRef.current) {
      inputRef.current.value = ""; // Reset file input
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-card rounded-xl shadow-lg">
      <div>
        <label
          htmlFor="resume-upload"
          className={cn(
            "flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
            dragActive ? "border-primary bg-primary/10" : "border-border hover:border-primary/70 hover:bg-accent/5",
            selectedFile ? "border-primary" : ""
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={selectedFile ? undefined : onBrowseClick} // Prevent re-opening file dialog if file is selected
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {selectedFile ? (
              <>
                <FileText className="w-12 h-12 mb-3 text-primary" />
                <p className="mb-2 text-sm text-foreground font-semibold">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">({(selectedFile.size / 1024).toFixed(2)} KB)</p>
                 <Button variant="ghost" size="sm" onClick={(e) => {e.stopPropagation(); removeFile();}} className="mt-2 text-destructive hover:text-destructive/80">
                  <XCircle className="mr-2 h-4 w-4" /> Remove
                </Button>
              </>
            ) : (
              <>
                <UploadCloud className={cn("w-12 h-12 mb-3", dragActive ? "text-primary" : "text-muted-foreground")} />
                <p className={cn("mb-2 text-sm", dragActive ? "text-primary" : "text-muted-foreground")}>
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">PDF or DOCX (MAX. 5MB)</p>
              </>
            )}
          </div>
          <input
            ref={inputRef}
            id="resume-upload"
            type="file"
            className="hidden"
            onChange={handleChange}
            accept={acceptedFileExtensions}
            disabled={isProcessing}
          />
        </label>
      </div>

      {isProcessing && (
        <div className="w-full">
          <Progress value={100} className="h-2 animate-pulse" />
          <p className="text-sm text-center text-primary mt-2">Analyzing your resume...</p>
        </div>
      )}

      <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={!selectedFile || isProcessing}>
        {isProcessing ? 'Processing...' : 'Analyze Resume'}
      </Button>
    </form>
  );
}
