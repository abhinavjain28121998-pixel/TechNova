const fs = require('fs');
let t = fs.readFileSync('src/data/procurementAIArticles.ts', 'utf8');

t = t.replace(/\n`\n`,/g, '\n`,');

fs.writeFileSync('src/data/procurementAIArticles.ts', t);
