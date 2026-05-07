const fs = require('fs');
const filesToProcess = [
  'src/data/posts.ts',
  'src/data/hackettArticles.ts',
  'src/data/newSeoArticles.ts',
  'src/data/eeatPosts.ts',
  'src/data/transformationPosts.ts',
  'src/data/moreTransformationPosts.ts',
  'src/data/aiArticles.ts'
];

filesToProcess.forEach(file => {
  let text = fs.readFileSync(file, 'utf8');
  let lines = text.split('\n');
  
  lines = lines.map(line => {
    // Only target lines that start with 'tags:' or '    tags:' and have multiple quoted strings
    if (/^\s*tags:\s*/.test(line)) {
      // If it's just `tags: [` (multiline start), skip it
      if (line.trim() === 'tags: [') return line;

      // Strip all brackets and links
      let cleaned = line.replace(/[\[\]]/g, '').replace(/\(\/blog\/[a-zA-Z0-9_\-]+\)/g, '');
      
      // Extract quoted strings
      let matches = cleaned.match(/(['"])(.*?)\1/g);
      if (matches) {
        return '    tags: [' + matches.join(', ') + '],';
      }
    }
    return line;
  });

  fs.writeFileSync(file, lines.join('\n'));
});
console.log('Repaired tags arrays.');
