const fs = require('fs');
let t = fs.readFileSync('src/data/procurementAIArticles.ts', 'utf8');

const parts = t.split('\n***\n\n### Schema Markup\n\n\\`\\`\\`json\n');
let result = parts[0];

for (let i = 1; i < parts.length; i++) {
  const part = parts[i];
  const endIdx = part.indexOf('\\`\\`\\`\n');
  if (endIdx !== -1) {
    result += part.substring(endIdx + 5);
  } else {
    result += part; // fallback
  }
}

fs.writeFileSync('src/data/procurementAIArticles.ts', result);
