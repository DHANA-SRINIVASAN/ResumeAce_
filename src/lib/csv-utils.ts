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

  // Header row based on user's specified order
  rows.push(['Name', 'Skills', 'Experience', 'Projects']);

  // Data row
  const skillsString = analysis.skills && analysis.skills.length > 0 ? analysis.skills.join('\n') : '';
  const experienceString = analysis.experience || '';
  const projectsString = analysis.projects && analysis.projects.length > 0 ? analysis.projects.join('\n') : '';
  
  rows.push([
    escapeCsvCell(analysis.name),
    escapeCsvCell(skillsString),
    escapeCsvCell(experienceString),
    escapeCsvCell(projectsString)
  ]);

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
