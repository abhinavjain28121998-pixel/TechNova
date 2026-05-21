const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'src', 'data');
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.ts'));

let totalFixed = 0;

files.forEach(file => {
  const filePath = path.join(dataDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Remove blocks starting with ### Article and FAQ Schema
  // up to the next ``` or \`\`\`
  content = content.replace(/### Article and FAQ Schema \(JSON-LD\)[\s\S]*?```/g, '');
  content = content.replace(/### Article and FAQ Schema \(JSON-LD\)[\s\S]*?\\`\\`\\`/g, '');
  
  // Try removing just ```html ... ``` or \`\`\`html ... \`\`\` anywhere that resembles schema
  content = content.replace(/```html[\s\S]*?<script type="application\/ld\+json">[\s\S]*?```/g, '');
  content = content.replace(/\\`\\`\\`html[\s\S]*?<script type="application\/ld\+json">[\s\S]*?\\`\\`\\`/g, '');

  // Also remove standalone <script type="application/ld+json"> blocks in markdown
  // if they are not enclosed in ``` but just dumped there.
  content = content.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed schemas in ${file}`);
    totalFixed++;
  }
});

console.log(`Total files fixed: ${totalFixed}`);
