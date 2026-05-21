const fs = require('fs');
let t = fs.readFileSync('src/data/financeAIArticles.ts', 'utf8');

const matches = t.match(/```html[\s\S]*?```/g);
if (matches) {
   matches.forEach(m => { t = t.replace(m, ''); });
}
fs.writeFileSync('src/data/financeAIArticles.ts', t);
console.log("Removed backtick blocks");
