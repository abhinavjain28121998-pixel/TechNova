const fs = require('fs');
const content = fs.readFileSync('src/data/posts.ts', 'utf8');
const images = [
  "'/tech_dashboard_ai.png'",
  "'/ai_neural_network_finance.png'",
  "'/cyber_finance_dashboard.png'"
];
let i = 0;
const newContent = content.replace(/coverImage:\s*'[^']+'/g, () => {
    return 'coverImage: ' + images[(i++) % images.length];
});
fs.writeFileSync('src/data/posts.ts', newContent);
console.log('Replaced images count: ', i);
