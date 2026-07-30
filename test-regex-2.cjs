const fs = require('fs');
const content = fs.readFileSync('public/data/articles.json', 'utf8');
const data = JSON.parse(content);
const article = data.find(p => p.slug === 'agentic-ai-automation-multi-agent-workflows');

const replaced = article.content.replace(/```json\s*\{[\s\S]*?"@context"\s*:\s*"https?:\/\/schema\.org"[\s\S]*?\}\s*```/g, '');

if (replaced.includes('@context')) {
  console.log('REGEX FAILED to remove the schema block!');
  console.log(article.content.substring(article.content.indexOf('```json')));
} else {
  console.log('REGEX SUCCEEDED!');
}
