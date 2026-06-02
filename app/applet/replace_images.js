const fs = require('fs');

const path = 'src/data/posts.ts';
let content = fs.readFileSync(path, 'utf-8');

const images = [
    "'/tech_dashboard_ai.png'",
    "'/ai_neural_network_finance.png'",
    "'/cyber_finance_dashboard.png'"
];

let i = 0;
content = content.replace(/coverImage:\s*'https:\/\/images\.unsplash\.com[^']+'/g, () => {
    const img = images[i % images.length];
    i++;
    return `coverImage: ${img}`;
});

fs.writeFileSync(path, content);
console.log('Images replaced in posts.ts');
