const fs = require('fs');
const size = fs.statSync('public/banners/generative-ai-resume-screening.png').size;
console.log('Size:', size);
