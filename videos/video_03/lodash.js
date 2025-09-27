// app.js

// Import the entire Lodash library
const _ = require("lodash");

// Example 1: Capitalize the first letter of each word in a sentence
const sentence = "lodash is awesome";
const capitalizedSentence = _.startCase(sentence);
console.log(`Original sentence: "${sentence}"`);
console.log(`Capitalized sentence: "${capitalizedSentence}"`); // Output: "Lodash Is Awesome"

// Example 2: Compact an array (remove falsy values)
const arrayWithFalsy = [0, 1, false, 2, '', 3, null, undefined];
const compactedArray = _.compact(arrayWithFalsy);
console.log(`Original array: [${arrayWithFalsy}]`);
console.log(`Compacted array: [${compactedArray}]`); // Output: [1, 2, 3]

// Example 3: Get the unique elements of an array
const numbers = [1, 2, 2, 3, 1, 4];
const uniqueNumbers = _.uniq(numbers);
console.log(`Original numbers: [${numbers}]`);
console.log(`Unique numbers: [${uniqueNumbers}]`); // Output: [1, 2, 3, 4]