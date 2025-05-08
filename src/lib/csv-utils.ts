// src/lib/csv-utils.ts
'use client';

import type { AnalyzeResumeOutput } from '@/ai/flows/resume-analyzer';

function escapeCsvCell(cell: string | undefined | null): string {
  if (cell == null) {
    return '';
  }
  const str = String(cell);
  // If the cell contains a comma, newline, or double quote, enclose it in double quotes
  // and escape any existing double quotes by doubling them.
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportAnalysisToCsv(analysis: AnalyzeResumeOutput, filename: string = 'resume-analysis.csv'): void {
  const rows: string[][] = [];

  // Header row for the CSV
  rows.push(['Category', 'Details']);

  // Add Name
  rows.push(['Name', escapeCsvCell(analysis.name)]);

  // Add Contact Details
  rows.push(['Contact Details', escapeCsvCell(analysis.contactDetails)]);

  // Add Skills section
  rows.push(['Skills', '']); // Main category header
  if (analysis.skills && analysis.skills.length > 0) {
    analysis.skills.forEach(skill => {
      rows.push(['', escapeCsvCell(skill)]); // Each skill as a sub-item
    });
  } else {
    rows.push(['', 'N/A']);
  }

  // Add Education
  // Education can be a long text, ensure it's properly escaped.
  rows.push(['Education', escapeCsvCell(analysis.education)]);

  // Add Experience
  // Experience can also be a long text.
  rows.push(['Experience', escapeCsvCell(analysis.experience)]);

  // Add Projects section
  rows.push(['Projects', '']); // Main category header
  if (analysis.projects && analysis.projects.length > 0) {
    analysis.projects.forEach(project => {
      rows.push(['', escapeCsvCell(project)]); // Each project as a sub-item
    });
  } else {
    rows.push(['', 'N/A']);
  }

  // Convert rows to CSV string
  const csvContent = rows.map(e => e.join(",")).join("\n");

  // Create a Blob with UTF-8 BOM for better Excel compatibility with special characters
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement("a");
  if (link.download !== undefined) { // Feature detection
    // Create a link to the file
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Clean up
  } else {
    // Fallback for older browsers (e.g. IE)
    // This might not work as well, or might open in a new window.
    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + BOM + csvContent);
    window.open(encodedUri);
  }
}
