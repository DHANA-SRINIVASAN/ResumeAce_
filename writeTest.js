const fs = require('fs');

// Write to a file
fs.writeFileSync('test_output.txt', 'This is a test\n');
console.log('File written successfully');

// Append to the file
fs.appendFileSync('test_output.txt', 'This is another line\n');
console.log('File appended successfully');

// Read the file
const content = fs.readFileSync('test_output.txt', 'utf8');
console.log('File content:', content);