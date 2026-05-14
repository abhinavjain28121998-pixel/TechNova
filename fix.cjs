const fs = require('fs');
let text = fs.readFileSync('src/data/hrArticles.ts', 'utf8');
text = text.replace(/content: \\`/g, 'content: `');
text = text.replace(/\\`\n  }/g, '`\n  }');
fs.writeFileSync('src/data/hrArticles.ts', text);
