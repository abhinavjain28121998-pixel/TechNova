const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/data/articles.json', 'utf8'));
const unique = [];
const seen = new Set();
for (const p of data) {
  if (!seen.has(p.slug)) {
    seen.add(p.slug);
    unique.push(p);
  }
}
fs.writeFileSync('public/data/articles.json', JSON.stringify(unique, null, 2));
console.log('Fixed duplicates, remaining:', unique.length);
