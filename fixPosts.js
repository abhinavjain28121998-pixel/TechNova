import fs from 'fs';

const file = fs.readFileSync('src/data/posts.ts', 'utf8');
const target = 'content: \\`';
const newContent = file.replace(/content: \\`/g, 'content: `').replace(/\*\*\*\\\\`/g, '***`');
fs.writeFileSync('src/data/posts.ts', newContent);
