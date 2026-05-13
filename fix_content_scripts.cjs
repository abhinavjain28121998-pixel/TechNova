const fs = require('fs');

function fixFile(file) {
  let content = fs.readFileSync(file, 'utf-8');
  let faqMatch = content.match(/<script type="application\/ld\+json">\s*\{\s*"@context":\s*"https:\/\/schema.org",\s*"@type":\s*"FAQPage"[\s\S]*?<\/script>/s);
  
  const faqs = [];
  if (faqMatch) {
    try {
      const scriptContent = faqMatch[0].replace(/<script[^>]*>/, '').replace(/<\/script>/, '');
      const parsed = JSON.parse(scriptContent);
      if (parsed.mainEntity) {
        for (const item of parsed.mainEntity) {
           faqs.push({
             question: item.name,
             answer: item.acceptedAnswer.text
           });
        }
      }
    } catch(e) {
      console.log('Error parsing FAQ in', file, e);
    }
  }

  // Remove all script blocks from content
  content = content.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\n*/g, '');

  // Insert faqs if they don't exist yet but we found some
  if (faqs.length > 0 && !content.includes('faqs: [')) {
    const faqString = "faqs: " + JSON.stringify(faqs, null, 6).replace(/ {6}\}/g, '    }').replace(/ {6}\]/g, '    ]') + ",\n    content: `\n";
    content = content.replace(/content: [\s]*`/, faqString);
  }
  
  fs.writeFileSync(file, content);
}

fixFile('src/data/algoTradingPost.ts');
fixFile('src/data/creditScoringPost.ts');
fixFile('src/data/riskAssessmentPost.ts');
