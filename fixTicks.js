import fs from 'fs';

let file = fs.readFileSync('src/data/posts.ts', 'utf8');

// The block starts at `id: 'agentic-ai-enterprise-transformation',`
const startIndex = file.indexOf("id: 'agentic-ai-enterprise-transformation'");
let before = file.slice(0, startIndex);
let block = file.slice(startIndex);

// In the block, fix the internal backticks.
// We know `content: ` and `***\`` are the boundaries. Let's just blindly replace any `\`/blog/` with `'/blog/`
block = block.replace(/\`/g, "'"); // replace all backticks with single quotes
block = block.replace(/content: '/g, 'content: `');
block = block.replace(/\*\*\*'/g, '***`');

fs.writeFileSync('src/data/posts.ts', before + block);
