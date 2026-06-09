const fs = require('fs');

const path = 'src/data/advancedHrLearningArticles.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/\[\[Gen AI\]\([^)]+\) in HR\]/g, '[Gen AI in HR]');
content = content.replace(/\[\[Generative AI\]\([^)]+\) consulting company\]/g, '[Generative AI consulting company]');

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed nested links');
