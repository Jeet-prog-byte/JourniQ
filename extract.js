const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, 'server', 'seed.js');
const seedData = fs.readFileSync(seedPath, 'utf8');

const startIndex = seedData.indexOf('const packages = [');
const endIndex = seedData.indexOf(';\n\n  for (const pkg of');

const packagesCode = seedData.substring(startIndex, endIndex);

let finalCode = `export ${packagesCode};\n\n`;

// Also extract reviews and bookings for initial mock state
finalCode += `export const initialBookings = [];\n`;
finalCode += `export const initialReviews = [\n  { id: 1, user_id: 2, package_id: 1, rating: 5, comment: 'Absolutely magical experience! The villa was stunning and the temple tour was unforgettable. Worth every rupee!', user_name: 'Rahul Sharma' },\n  { id: 2, user_id: 3, package_id: 1, rating: 4, comment: 'Beautiful destination, great guides. The food was amazing.', user_name: 'Priya Patel' }\n];\n`;

const outPath = path.join(__dirname, 'client', 'src', 'services', 'mockData.js');
fs.writeFileSync(outPath, finalCode, 'utf8');
console.log('Extraction complete');
