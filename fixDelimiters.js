import fs from 'fs';

let file = fs.readFileSync('src/data/posts.ts', 'utf8');

// I will run a generic replaced based on the structure:
// All posts have `content: '` followed by line breaks instead of `content: \``
file = file.replace(/content: '/g, 'content: `');

// All posts end with either `',` followed by whitespace and `coverImage:`
file = file.replace(/',\n(\s+)coverImage/g, '`,\n$1coverImage');

// Let's also check if there's any stray `content:`
file = file.replace(/metaDescription: '(.*?)',\n(\s+)content: `/g, "metaDescription: '$1',\n$2content: `");

fs.writeFileSync('src/data/posts.ts', file);
