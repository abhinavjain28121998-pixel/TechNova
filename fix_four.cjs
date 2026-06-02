const fs = require('fs');
let content = fs.readFileSync('src/data/fourNewUseCases.ts', 'utf8');

content = content.replace(/coverImage:\s*'https:\/\/images\.unsplash\.com[^']+'/g, (match) => {
    if (match.includes('1554224155')) return "coverImage: '/invoice_processing_ai.png'";
    if (match.includes('1589829085413')) return "coverImage: '/contract_analysis_ai.png'";
    if (match.includes('1611974789855')) return "coverImage: '/portfolio_optimization_ai.png'";
    if (match.includes('1556742049')) return "coverImage: '/transaction_monitoring_ai.png'";
    return match;
});

fs.writeFileSync('src/data/fourNewUseCases.ts', content);
console.log('Images replaced in fourNewUseCases.ts');
