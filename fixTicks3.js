import fs from 'fs';

let file = fs.readFileSync('src/data/posts.ts', 'utf8');

file = file.replace(/\*\*\*\\',/g, '***\`,');
file = file.replace(/\*\*\*',/g, '***\`,');

fs.writeFileSync('src/data/posts.ts', file);
