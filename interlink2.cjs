const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'src', 'data');
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.ts'));

// Step 1: Extract all slugs and titles/keywords
let allPosts = [];

files.forEach(file => {
  const content = fs.readFileSync(path.join(dataDir, file), 'utf-8');
  
  const blocks = content.split('slug:');
  for (let i = 1; i < blocks.length; i++) {
    const slugMatch = blocks[i].match(/^\s*'([^']+)'/);
    const titleMatch = blocks[i].match(/title:\s*'([^']+)'/);
    if (slugMatch && titleMatch) {
       const slug = slugMatch[1];
       const title = titleMatch[1];
       allPosts.push({ slug, title, file });
    }
  }
});

let termsToLink = [
  { term: /\b(fraud detection)\b/i, slug: '/blog/ai-fraud-detection-retail-banking', file: 'fraudDetectionPost.ts' },
  { term: /\b(credit scoring)\b/i, slug: '/blog/ai-credit-scoring-inclusive-lending', file: 'creditScoringPost.ts' },
  { term: /\b(algorithmic trading)\b/i, slug: '/blog/ai-algorithmic-trading-capital-markets', file: 'algoTradingPost.ts' },
  { term: /\b(risk assessment)\b/i, slug: '/blog/ai-risk-assessment-corporate-finance', file: 'riskAssessmentPost.ts' },
  { term: /\b(agentic ai)\b/i, slug: '/blog/agentic-ai-enterprise-transformation', file: 'posts.ts' },
  { term: /\b(generative ai)\b/i, slug: '/blog/mastering-ai-implementation-practical-enterprise-guide', file: 'posts.ts' },
  { term: /\b(digital transformation)\b/i, slug: '/blog/expert-guide-digital-transformation', file: 'posts.ts' },
  { term: /\b(supply chain)\b/i, slug: '/blog/gen-ai-in-procurement-strategic-sourcing', file: 'posts.ts' },
  { term: /\b(data privacy)\b/i, slug: '/blog/demystifying-zero-trust', file: 'posts.ts' },
  { term: /\b(large language models)\b/i, slug: '/blog/mastering-ai-implementation-practical-enterprise-guide', file: 'posts.ts' }
];

allPosts.forEach(p => {
  let keyword = p.title.split(':')[0].trim();
  if (keyword.length < 5) keyword = p.title.split(' ').slice(0, 3).join(' ');
  // Avoid very common words
  if (keyword.toLowerCase() !== 'the' && keyword.toLowerCase() !== 'ai' && keyword.length > 5) {
      termsToLink.push({
        term: new RegExp(`\\b(${keyword.replace(/[.*+?^$\{ \}()[\]\\]/g, '\\$&')})\\b`, 'i'),
        slug: `/blog/${p.slug}`,
        file: p.file
      });
  }
});

let updatedFiles = 0;

files.forEach(file => {
  const filePath = path.join(dataDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  let originalContent = content;

  let contentBlocks = content.split(/content:\s*`/);
  
  for (let i = 1; i < contentBlocks.length; i++) {
    // Find the end of the template literal
    let endIdx = contentBlocks[i].lastIndexOf('`');
    
    if (endIdx !== -1) {
      let text = contentBlocks[i].substring(0, endIdx);
      let rest = contentBlocks[i].substring(endIdx);
      
      let linksAdded = 0;
      
      for (const link of termsToLink) {
        if (linksAdded >= 5) break; 
        if (link.file === file) continue; 
        if (text.includes(link.slug)) continue; 
        
        // Manual global replace with bounds checking
        let tempText = text;
        const match = tempText.match(link.term);
        if (match) {
           const before = tempText.substring(0, match.index);
           const openBracket = before.lastIndexOf('[');
           const closeBracket = before.lastIndexOf(']');
           const openParen = before.lastIndexOf('(');
           const closeParen = before.lastIndexOf(')');
           const isInsideLink = (openBracket > closeBracket) || (openParen > closeParen && before.substring(openParen - 1, openParen) === ']');
           
           if (!isInsideLink && !before.endsWith('#') && match[0].length > 3) {
             text = before + `[${match[0]}](${link.slug})` + tempText.substring(match.index + match[0].length);
             linksAdded++;
           }
        }
      }
      
      contentBlocks[i] = text + rest;
    }
  }

  content = contentBlocks.join('content: `');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    updatedFiles++;
  }
});

console.log('Updated ' + updatedFiles + ' files.');
