import fs from 'fs/promises'; // Using the promise-based fs module

console.log('Start');

try {
    const data = await fs.readFile('file.txt', 'utf8');
    console.log('File content:', data);
} catch (err) {
    console.error('Error reading file:', err);
}

console.log('End');