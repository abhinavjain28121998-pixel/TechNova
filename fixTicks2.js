import fs from 'fs';

let file = fs.readFileSync('src/data/posts.ts', 'utf8');

// I'll search for `***\n',\n    coverImage:` and replace with `***\n\`,\n    coverImage:`
file = file.replace(/\*\*\*\n',\n    coverImage:/g, '***\n`,\n    coverImage:');

fs.writeFileSync('src/data/posts.ts', file);
