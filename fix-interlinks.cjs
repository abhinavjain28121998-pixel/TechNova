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
  let content = fs.readFileSync(file, 'utf8');
  let lines = content.split('\n');
  lines = lines.map(line => {
    if (/^\s*(title|excerpt|metaDescription):/.test(line)) {
      // Replace markdown links with just the text
      return line.replace(/\[([^\]]+)\]\(\/blog\/[^\)]+\)/g, '$1');
    }
    return line;
  });
  fs.writeFileSync(file, lines.join('\n'));
});
console.log('Fixed metadata fields.');
