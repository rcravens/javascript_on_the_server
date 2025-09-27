const fs = require('fs/promises'); // Using the promise-based fs module

console.log('Start');

fs.readFile('file.txt', 'utf8')
    .then(data => {
        console.log('File content:', data);
    })
    .catch(err => {
        console.error('Error reading file:', err);
    });

console.log('End');