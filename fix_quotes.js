import fs from 'fs';

['src/data/industryArticlesPart1.ts', 'src/data/industryArticlesPart2.ts'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let fixed = content.replace(/content: "([\s\S]*?)"\n  \}/g, (match, p1) => {
    return 'content: `' + p1.replace(/\\"/g, '"').replace(/`/g, '\\`') + '`\n  }';
  });
  fs.writeFileSync(file, fixed);
});
