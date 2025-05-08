// src/components/resume-upload-form.tsx
"use client";

import React, { useState, useRef, useCallback } from 'react';
import { UploadCloud, FileText, XCircle, Image as ImageIcon } from 'lucide-react'; // Added ImageIcon
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


interface ResumeUploadFormProps {
  onAnalyze: (file: File) => Promise<void>;
  isProcessing: boolean;
}

const acceptedFileTypes: Record<string, string[]> = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'image/jpeg': ['.jpeg', '.jpg'],
  'image/png': ['.png'],
};
const acceptedFileExtensions = Object.values(acceptedFileTypes).flat().join(',');


export function ResumeUploadForm({ onAnalyze, isProcessing }: ResumeUploadFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [showImageNote, setShowImageNote] = useState(false);

  const handleFileChange = useCallback((file: File | null) => {
    if (file) {
      if (!acceptedFileTypes[file.type as keyof typeof acceptedFileTypes]) {
        toast({
          title: "Invalid File Type",
          description: `Please upload a PDF, DOCX, JPEG, or PNG file. You uploaded: ${file.name}`,
          variant: "destructive",
        });
        setSelectedFile(null);
        setShowImageNote(false);
        if (inputRef.current) {
            inputRef.current.value = ""; 
        }
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File Too Large",
          description: `Please upload a file smaller than 5MB. Your file is ${(file.size / (1024*1024)).toFixed(2)}MB.`,
          variant: "destructive",
        });
        setSelectedFile(null);
        setShowImageNote(false);
        if (inputRef.current) {
            inputRef.current.value = "";
        }
        return;
      }
      setSelectedFile(file);
      setShowImageNote(file.type.startsWith('image/'));
    } else {
      setSelectedFile(null);
      setShowImageNote(false);
    }
  }, [toast]);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  const onBrowseClick = () => {
    inputRef.current?.click();
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile && !isProcessing) {
      await onAnalyze(selectedFile);
    }
  }, [selectedFile, isProcessing, onAnalyze]);

  const removeFile = useCallback(() => {
    setSelectedFile(null);
    setShowImageNote(false);
    if(inputRef.current) {
      inputRef.current.value = ""; 
    }
  }, []);

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
          onClick={selectedFile ? undefined : onBrowseClick} 
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {selectedFile ? (
              <>
                {selectedFile.type.startsWith('image/') ? <ImageIcon className="w-12 h-12 mb-3 text-primary" /> : <FileText className="w-12 h-12 mb-3 text-primary" />}
                <p className="mb-2 text-sm text-foreground font-semibold break-all px-2">{selectedFile.name}</p>
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
                <p className="text-xs text-muted-foreground">PDF, DOCX, JPG, PNG (MAX. 5MB)</p>
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
      
      {showImageNote && (
        <Alert variant="default" className="mt-4 bg-primary/5 border-primary/20">
          <ImageIcon className="h-4 w-4 text-primary" />
          <AlertTitle className="text-primary font-medium">Image Resume Uploaded</AlertTitle>
          <AlertDescription className="text-primary/80">
            AI will attempt OCR (text extraction). For best results with images, ensure good clarity. Pre-converting complex image resumes to text or PDF might improve accuracy.
          </AlertDescription>
        </Alert>
      )}


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