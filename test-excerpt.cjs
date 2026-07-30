const fs = require('fs');
const content = fs.readFileSync('public/data/articles.json', 'utf8');
const data = JSON.parse(content);
const article = data.find(p => p.slug === 'agentic-ai-automation-multi-agent-workflows');

console.log(article.excerpt);
