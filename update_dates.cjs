const fs = require('fs');
let c = fs.readFileSync('src/data/seoArticlesLatest.ts', 'utf8');
c = c.replace(/date: '2026-05-\d+'/g, "date: '2026-06-02T05:00:00Z'");
c = c.replace(/featured: false/g, "featured: true");
fs.writeFileSync('src/data/seoArticlesLatest.ts', c);
console.log("Updated dates and featured");
