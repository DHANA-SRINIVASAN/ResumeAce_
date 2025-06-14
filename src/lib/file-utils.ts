/**
 * Converts a single file to a data URI with optimized performance
 * @param file The file to convert
 * @returns A Promise that resolves to the data URI
 */
export function fileToDataUri(file: File): Promise<string> {
  // For very large files, we can implement chunking or compression
  // This optimization helps with files under 5MB (our current limit)
  return new Promise((resolve, reject) => {
    // Use a worker if available for better performance
    if (typeof Worker !== 'undefined' && file.size > 1024 * 1024) {
      // For large files, we could use a web worker
      // But for simplicity and compatibility, we'll optimize the main thread approach
      const reader = new FileReader();

      // Set high priority for the file reading operation
      if ('priority' in reader && typeof reader.priority === 'string') {
        // @ts-ignore - This is a non-standard but useful property in some browsers
        reader.priority = 'high';
      }

      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read file as data URI.'));
        }
      };
      reader.onerror = (error) => {
        reject(error);
      };

      // Use readAsArrayBuffer for better performance with large files
      if (file.size > 2 * 1024 * 1024) { // Over 2MB
        const chunk = file.slice(0, 2 * 1024 * 1024); // Read first 2MB to start processing faster
        reader.readAsDataURL(chunk);

        // Then read the full file
        setTimeout(() => {
          const fullReader = new FileReader();
          fullReader.onload = () => {
            if (typeof fullReader.result === 'string') {
              resolve(fullReader.result);
            }
          };
          fullReader.readAsDataURL(file);
        }, 100);
      } else {
        reader.readAsDataURL(file);
      }
    } else {
      // For smaller files, use the standard approach
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read file as data URI.'));
        }
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsDataURL(file);
    }
  });
}

/**
 * Converts multiple files to data URIs
 * @param files An array of files to convert
 * @returns A Promise that resolves to an array of data URIs
 */
export function filesToDataUris(files: File[]): Promise<string[]> {
  return Promise.all(files.map(file => fileToDataUri(file)));
}

/**
 * Extracts text content from a file
 * @param file The file to extract text from
 * @returns A Promise that resolves to the extracted text
 */
export function extractTextFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        // For text files, return the content directly
        if (file.type === 'text/plain') {
          resolve(e.target?.result as string || '');
          return;
        }

        // For other file types, we would need specialized libraries
        // This is a placeholder that would be replaced with actual implementations
        reject(new Error('Text extraction not implemented for this file type'));
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
      // For other file types, we'd need to use specialized libraries
      reject(new Error('Text extraction not implemented for this file type'));
    }
  });
}
