import fs from 'fs';
import path from 'path';
import { POSTS } from '../src/data/posts.ts';

const dataDir = path.resolve(process.cwd(), 'src/data');

// 1. Build a robust dictionary of linking opportunities.
const linkTargets = POSTS.map(post => {
  // Variations based on title and tags
  const phrases = [ post.title ];
  
  if (post.tags) {
    post.tags.forEach(tag => {
      if (tag.length > 5) phrases.push(tag);
    });
  }

  // Generate some common synonyms based on category
  const titleLower = post.title.toLowerCase();
  
  // Specific fallbacks
  if (titleLower.includes('cybersecurity')) phrases.push('cybersecurity strategies', 'cyber threats');
  if (titleLower.includes('marketing')) phrases.push('marketing transformation', 'digital marketing AI');
  if (titleLower.includes('sales')) phrases.push('sales automation');
  if (titleLower.includes('agentic ai')) phrases.push('agentic systems', 'autonomous agents');
  if (titleLower.includes('supply chain')) phrases.push('supply chain resilience');

  // Clean and unique
  const uniquePhrases = Array.from(new Set(phrases.map(p => p.trim()))).filter(p => p.length > 5);

  return {
    slug: post.slug,
    phrases: uniquePhrases.sort((a, b) => b.length - a.length) // match longest first
  };
});

// Helper to reliably find text outside existing links and markdown headings
function replaceWithTracking(content, maxLinks = 4) {
  let linkCount = 0;
  let newContent = content;
  
  // Shuffle targets to avoid always linking the same first articles
  const shuffledTargets = [...linkTargets].sort(() => Math.random() - 0.5);

  for (const target of shuffledTargets) {
    if (linkCount >= maxLinks) break;
    
    for (const phrase of target.phrases) {
      // Create a regex that finds the phrase ignoring case, 
      // but ensure it's not inside `[]`, `()`, inside an existing markdown link, or inside a header `#`.
      // This is tricky with simple regex. Let's use a replacer function.
      
      const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b(${escapeRegExp(phrase)})\\b`, 'i');
      
      // We'll split the content by lines, and only operate on standard paragraph lines (not headers, not code blocks).
      const lines = newContent.split('\n');
      let replacedInTarget = false;
      
      let inCodeBlock = false;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim().startsWith('```')) {
          inCodeBlock = !inCodeBlock;
          continue;
        }
        if (inCodeBlock) continue;
        if (line.trim().startsWith('#')) continue;
        if (line.trim().startsWith('>')) continue;
        if (line.includes('](/blog/')) continue; // Skip lines that already have internal links to avoid messing them up
        
        // Find if phrase is in line
        if (regex.test(line)) {
          // Replace it
          const originalLine = line;
          lines[i] = line.replace(regex, `[$1](/blog/${target.slug})`);
          if (lines[i] !== originalLine) {
            replacedInTarget = true;
            linkCount++;
            break; // only one link per target
          }
        }
      }
      
      if (replacedInTarget) {
        newContent = lines.join('\n');
        break; // break the phrases loop, move to next target
      }
    }
  }
  
  return newContent;
}

// 2. Iterate and modify files using regex against data structures.
async function main() {
  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.ts') && f !== 'posts.ts' && f !== 'authors.ts');
  
  for (const file of files) {
    const filePath = path.join(dataDir, file);
    let fileSource = fs.readFileSync(filePath, 'utf8');
    
    // We want to replace inside `content: \`...\``
    // A robust way mapping replace string
    const blockRegex = /(content\s*:\s*`)([\s\S]*?)(`)/g;
    
    let hasChanges = false;
    fileSource = fileSource.replace(blockRegex, (match, prefix, content, suffix) => {
      const newContent = replaceWithTracking(content, 4 + Math.floor(Math.random() * 3)); // 4 to 6 links
      if (newContent !== content) hasChanges = true;
      return prefix + newContent + suffix;
    });
    
    if (hasChanges) {
      fs.writeFileSync(filePath, fileSource, 'utf8');
      console.log(`Updated links in ${file}`);
    }
  }
}

main().catch(console.error);
