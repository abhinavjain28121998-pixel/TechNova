const fs = require('fs');

const pt1 = fs.readFileSync('src/data/industryArticlesPart1.ts', 'utf8');
const pt2 = fs.readFileSync('src/data/industryArticlesPart2.ts', 'utf8');

// Strip out EVERYTHING between ### Article and FAQ Schema (JSON-LD) and the end of the content string.
function stripSchema(text) {
  return text.replace(/### Article and FAQ Schema[\s\S]*?(?=\n\s*\n\s*\`\n\s*\}|\n\s*\}\n\])/g, '');
}

let new1 = stripSchema(pt1);
let new2 = stripSchema(pt2);

// Fix end of file formatting because we stripped out the end of the content backtick.
new1 = new1.replace(/(\`\n\s*\})?$/, '\`\n  }\n];');
new2 = new2.replace(/(\`\n\s*\})?$/, '\`\n  }\n];');
// But actually my regex above was just looking ahead.
// Let's just do a brutal replace:
function cleanFile(t) {
  let lines = t.split('\n');
  let newLines = [];
  let inSchema = false;
  for (let l of lines) {
    if (l.includes('### Article and FAQ Schema (JSON-LD)')) {
      inSchema = true;
    }
    if (inSchema) {
      if (l.trim() === '}' && newLines[newLines.length-1].trim() === '`') {
        // we reached the end of the object
        inSchema = false;
        newLines.push(l);
      } else if (l.trim() === '];') {
        inSchema = false;
        newLines.push(l);
      }
    } else {
      newLines.push(l);
    }
  }
  return newLines.join('\n');
}

fs.writeFileSync('src/data/industryArticlesPart1.ts', cleanFile(pt1));
fs.writeFileSync('src/data/industryArticlesPart2.ts', cleanFile(pt2));

console.log('done');
