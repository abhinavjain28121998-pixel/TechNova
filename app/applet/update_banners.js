import fs from 'fs';
import path from 'path';

const basePath = './src/data';
const files = fs.readdirSync(basePath).filter(f => f.endsWith('.ts') && f !== 'authors.ts' && f !== 'posts.ts');

function rewriteCoverImages() {
  files.forEach(file => {
    const filePath = path.join(basePath, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Regex to match "title: '...', " and "coverImage: '...' " 
    // We actually need to find each post and replace the coverImage.
    // The safest way is to match title and then replace the next coverImage.
    
    let updatedContent = content.replace(/title:\s*["'`](.*?)["'`][\s\S]*?(?:coverImage:.*?|)(?:date:)/g, (match, titleText) => {
        // Construct the prompt
        // remove any special chars from title to keep the prompt clean but descriptive
        const cleanTitle = titleText.replace(/[^a-zA-Z0-9 ]/g, '');
        // prompt engineering for pollinations
        const prompt = `A highly professional, modern, and visually engaging banner image for an article titled "${cleanTitle}". High resolution, elegant, AI-focused, photographic, dramatic lighting.`;
        const encodedPrompt = encodeURIComponent(prompt);
        const newCoverImage = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1200&height=630&nologo=true`;

        // Check if there's an existing coverImage property in this match
        if (match.match(/coverImage:\s*["'`].*?["'`]/)) {
            return match.replace(/coverImage:\s*["'`].*?["'`]/, `coverImage: '${newCoverImage}'`);
        } else {
            // we need to inject it before date:
            return match.replace(/date:/, `coverImage: '${newCoverImage}',\n    date:`);
        }
    });

    if (content !== updatedContent) {
        fs.writeFileSync(filePath, updatedContent);
        console.log(`Updated ${file}`);
    } else {
        console.log(`No changes needed or matching failed for ${file}`);
    }
  });
}

rewriteCoverImages();
