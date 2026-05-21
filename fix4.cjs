const fs = require('fs');
let t = fs.readFileSync('src/data/financeAIArticles.ts', 'utf8');

// The string might literally have \`\`\`html Instead of just ```html
t = t.replace(/\\`\\`\\`html[\s\S]*?\\`\\`\\`/g, '');
t = t.replace(/```html[\s\S]*?```/g, '');

fs.writeFileSync('src/data/financeAIArticles.ts', t);
console.log("Removed literal escaped backtick blocks");
