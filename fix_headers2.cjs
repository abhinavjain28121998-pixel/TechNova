const fs = require('fs');

const files = [
  { path: 'src/data/itHelpdeskPost.ts' },
  { path: 'src/data/itChatbotPost.ts' },
  { path: 'src/data/itTicketPost.ts' },
  { path: 'src/data/itIncidentPost.ts' }
];

for (const file of files) {
  let content = fs.readFileSync(file.path, 'utf8');

  // Fix the previously broken headers
  content = content.replace(/## What AI means in (.*?)(?=\n\n)/g, '## What AI means in $1');
  
  // Let's just restore them correctly manually without regex greediness
  content = content.replace(/## What AI means in the IT support industry.*/g, '## What AI means in the IT support industry');
  content = content.replace(/## What AI means in the IT chatbot industry.*/g, '## What AI means in the IT chatbot industry');
  content = content.replace(/## What AI means in ticket classification.*/g, '## What AI means in ticket classification');
  content = content.replace(/## What AI means in incident management automation.*/g, '## What AI means in incident management automation');
  content = content.replace(/## Key use cases.*/g, '## Key use cases');
  content = content.replace(/## Benefits for businesses.*/g, '## Benefits for businesses');
  content = content.replace(/## Challenges and risks.*/g, '## Challenges and risks');
  content = content.replace(/## How to implement AI effectively/gi, '## How to implement AI effectively');
  content = content.replace(/## Why expert AI implementation matters/gi, '## Why expert AI implementation matters');

  fs.writeFileSync(file.path, content);
}
console.log('Fixed headers.');
