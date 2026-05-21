const fs = require('fs');

const file = 'src/data/financeAIArticles.ts';
let t = fs.readFileSync(file, 'utf8');

// replace everything from ### Article and FAQ Schema (JSON-LD) until the next ` ``` `
// The regex: /### Article and FAQ Schema \(JSON-LD\)[\s\S]*?```/g

let replaced = t.replace(/### Article and FAQ Schema \(JSON-LD\)[\s\S]*?```/g, '');

fs.writeFileSync(file, replaced);
console.log("Replaced schemas robustly. Differences: " + (t !== replaced));
