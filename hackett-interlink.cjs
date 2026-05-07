const fs = require('fs');

const INTERLINK_MAP = [
  { keyword: 'digital transformation', slug: 'expert-guide-digital-transformation' },
  { keyword: 'applied intelligence', slug: 'applied-intelligence-programs' },
  { keyword: 'zero trust', slug: 'demystifying-zero-trust' },
  { keyword: 'due diligence', slug: 'mastering-ai-powered-due-diligence-mergers-acquisitions-risk' },
  { keyword: 'solution intelligence', slug: 'solution-intelligence-the-pinnacle-of-enterprise-automation' },
  { keyword: 'global business services', slug: 'expert-guide-gbs-transformation' },
  { keyword: 'human resources', slug: 'expert-guide-hr-transformation' },
  { keyword: 'techmatch', slug: 'techmatch-vendor-selection-strategy' },
  { keyword: 'solutionmap', slug: 'solutionmap-procurement-technology-selection' },
  { keyword: 'askhackett', slug: 'askhackett-revolutionizing-benchmarking-ai' },
  { keyword: 'ai readiness', slug: 'navigating-ai-readiness-with-hackett-ai-xplr' }
];

let text = fs.readFileSync('src/data/hackettArticles.ts', 'utf8');

// First, strip all our markdown links just in case so we have clean basis
INTERLINK_MAP.forEach(({ slug }) => {
    // replace `[text](/blog/slug)` with `text`
    const regex = new RegExp(`\\[([^\\]]+)\\]\\(\\/blog\\/${slug}\\)`, 'g');
    text = text.replace(regex, '$1');
});

// Since replace with case-insensitivity on regex `\b(keyword)\b` will lose case of original 
// text when replaced with `[$1]`, we must use `$1` to retain the matched string case.
// Also we need to make sure we don't interlink inside URLs or already linked text.

const articleBlocks = text.split("id: '");
let parsedBlocks = articleBlocks.map((block, index) => {
    if (index === 0) return block; 
    const slugMatch = block.match(/^([A-Za-z0-9_\-]+)'/);
    const blockSlug = slugMatch ? slugMatch[1] : null;

    let newBlock = block;

    INTERLINK_MAP.forEach(({ keyword, slug }) => {
        if (blockSlug === slug) return; 

        // Let's use negative lookbehind for markdown brackets, urls
        const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(?<!\\[)(?<!\\-)(?<!\\/)\\b(${escapedKeyword})\\b(?!\\])(?!\\-)(?!\\/)(?!\\w)`, 'gi');
        
        newBlock = newBlock.replace(regex, `[$1](/blog/${slug})`);
    });

    return newBlock;
});

// Let's also fix the tags arrays to not have markdown in it
// and faqs if they are matching. The `repair-tags.cjs` might have fixed it but let's be careful.
// Wait, `repair-tags.cjs` removed markdown links from tags.
// Let's write the file.
fs.writeFileSync('src/data/hackettArticles.ts', parsedBlocks.join("id: '"));
console.log('done running hackett-interlink');
