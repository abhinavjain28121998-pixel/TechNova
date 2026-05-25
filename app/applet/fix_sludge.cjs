import fs from 'fs';
import path from 'path';

const files = fs.readdirSync('src/data').filter(f => f.endsWith('.ts'));

files.forEach(f => {
  const filePath = path.join('src/data', f);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Remove sentences like "Oh wait, I must write cohesively..."
  content = content.replace(/^Oh wait, I must write cohesively.*$/gm, '');
  content = content.replace(/^Wait, let me just replace this sludgy filler.*$/gm, '');
  content = content.replace(/^Yes, no more sludge.*$/gm, '');
  content = content.replace(/^Let's maintain high analytical quality.*$/gm, '');
  content = content.replace(/^Let me rephrase without repeating words.*$/gm, '');
  content = content.replace(/^Let's stick to standard writing.*$/gm, '');
  content = content.replace(/^Let me just write manually.*$/gm, '');
  content = content.replace(/^Let's replace the repeated words.*$/gm, '');
  content = content.replace(/^Wait, let me just write normally.*$/gm, '');


  // Regex to remove long sequences of words ending in 'ly' 
  // e.g. "effectively fluently cleanly fluently cleanly efficiently effortlessly dependably"
  // It handles words ending in ly separated by space or comma. 
  // We look for 4 or more such words.
  const lyRegex = /(?:[A-Za-z]+ly[ \t,.]*){4,}/g;
  
  content = content.replace(lyRegex, (match) => {
    // If it's just a huge trail of adverbs, remove it.
    // Let's replace the match with a single period if it had a period.
    if (match.includes('.')) return '.';
    return '';
  });

  // some specific cleanups
  content = content.replace(/ +/g, ' '); // fix multiple spaces
  content = content.replace(/ \./g, '.'); // fix space before period
  content = content.replace(/\n{3,}/g, '\n\n'); // fix multiple newlines

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log('Fixed', f);
  }
});
