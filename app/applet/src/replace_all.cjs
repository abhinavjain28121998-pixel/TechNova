const fs = require('fs');
const path = require('path');

const dir = 'src/data/';
const files = fs.readdirSync(dir);

const images = [
  "'/tech_dashboard_ai.png'",
  "'/ai_neural_network_finance.png'",
  "'/cyber_finance_dashboard.png'",
  "'/invoice_processing_ai.png'",
  "'/document_summarization_ai.png'"
];
let i = 0;

for (const file of files) {
  if (file.endsWith('.ts') || file.endsWith('.js')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    const newContent = content.replace(/coverImage:\s*'https:\/\/images\.unsplash\.com[^']+'/g, () => {
        return 'coverImage: ' + images[(i++) % images.length];
    });
    // also replace avatars
    const newContent2 = newContent.replace(/avatar:\s*'https:\/\/images\.unsplash\.com[^']+'/g, () => {
        return "avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Expert'";
    });
    if (content !== newContent2) {
       fs.writeFileSync(filePath, newContent2);
       console.log('Replaced images in', file);
    }
  }
}
console.log('Replaced images total count: ', i);
