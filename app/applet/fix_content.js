const fs = require('fs');
let t = fs.readFileSync('src/data/financeAIArticles.ts', 'utf8');

const blocksToReplace = t.match(/### Article and FAQ Schema[\s\S]*?```/g);
if (blocksToReplace) {
  blocksToReplace.forEach(block => {
    t = t.replace(block, "");
  });
}
fs.writeFileSync('src/data/financeAIArticles.ts', t);
console.log("Done");
