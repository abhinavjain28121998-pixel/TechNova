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

function stripLinks(text) {
  return text.replace(/\[([^\]]+)\]\(\/blog\/[^\)]+\)/g, '$1');
}

filesToProcess.forEach(file => {
  let text = fs.readFileSync(file, 'utf8');
  
  // Fix tags: [...] on a single line
  text = text.replace(/tags:\s*\[(.*?)\]/g, (match, inner) => {
    return 'tags: [' + stripLinks(inner) + ']';
  });

  // Since newSeoArticles.ts might have multiline tags:
  // We can just use the fact that it only contains string literals with single quotes.
  // Actually, we can just replace the markdown link globally, but masking the content: fields.
  
  // Actually, it's easier to just pass the whole text line by line for tags because we know tags line contains tags:
  let lines = text.split('\n');
  lines = lines.map(line => {
    if (line.includes('tags:') || line.trim().startsWith("'") || line.trim().startsWith('"')) {
      // It's safe to strip links on these lines unless it's the `content` block
      // But we know `content` lines don't start with `'` or `"` ordinarily
      // Best is just to strip links on line that starts with 'tags:' or has tags and [
      if (line.includes('tags:') || line.includes('question:') || line.includes('answer:')) {
         return stripLinks(line);
      }
      // For multiline tags, they are just strings like `'Data & Analytics',`
      if (line.match(/^\s*['"](.*)['"],?\s*$/)) {
         return stripLinks(line);
      }
    }
    return line;
  });

  fs.writeFileSync(file, lines.join('\n'));
});
console.log('Fixed tags and faqs.');
