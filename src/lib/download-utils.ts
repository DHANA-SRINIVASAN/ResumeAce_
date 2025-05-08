// src/lib/download-utils.ts
'use client';

export function downloadHtml(htmlContent: string, filename: string): void {
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
  const link = document.createElement("a");

  if (link.download !== undefined) { // Feature detection
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
    const encodedUri = encodeURI("data:text/html;charset=utf-8," + htmlContent);
    window.open(encodedUri);
  }
}
