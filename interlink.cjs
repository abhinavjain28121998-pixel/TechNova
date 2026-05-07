const fs = require('fs');

const INTERLINK_MAP = [
  { keyword: 'Digital Transformation', slug: 'expert-guide-digital-transformation' },
  { keyword: 'Applied Intelligence', slug: 'applied-intelligence-programs' },
  { keyword: 'Zero Trust', slug: 'demystifying-zero-trust' },
  { keyword: 'Due Diligence', slug: 'mastering-ai-powered-due-diligence-mergers-acquisitions-risk' },
  { keyword: 'Solution Intelligence', slug: 'solution-intelligence-the-pinnacle-of-enterprise-automation' },
  { keyword: 'Global Business Services', slug: 'expert-guide-gbs-transformation' },
  { keyword: 'Human Resources', slug: 'expert-guide-hr-transformation' },
  { keyword: 'TechMatch', slug: 'techmatch-vendor-selection-strategy' },
  { keyword: 'SolutionMap', slug: 'solutionmap-procurement-technology-selection' },
  { keyword: 'AskHackett', slug: 'askhackett-revolutionizing-benchmarking-ai' },
  { keyword: 'AI Readiness', slug: 'navigating-ai-readiness-with-hackett-ai-xplr' }
];

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
  
  INTERLINK_MAP.forEach(({ keyword, slug }) => {
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Using RegExp to replace only if not enclosed in brackets
    // Also avoid matching inside URLs e.g. /blog/expert-guide-digital-transformation
    const regex = new RegExp(`(?<!\\[|\\-|\\/)\\b(${escapedKeyword})\\b(?!\\]|\\-|\\/|\\w)`, 'g');
    
    content = content.replace(regex, `[$1](/blog/${slug})`);
  });

  fs.writeFileSync(file, content);
});

console.log('Interlinking complete.');
