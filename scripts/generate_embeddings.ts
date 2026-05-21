import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import { POSTS } from '../src/data/posts.ts';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const embeddingsFile = path.resolve(process.cwd(), 'src/data/embeddings.json');

async function main() {
  const embeddings: Record<string, number[]> = {};
  
  if (fs.existsSync(embeddingsFile)) {
    Object.assign(embeddings, JSON.parse(fs.readFileSync(embeddingsFile, 'utf8')));
  }

  const postsToEmbed = POSTS.filter(p => !embeddings[p.id]);
  
  if (postsToEmbed.length === 0) {
    console.log("All posts already embedded.");
    return;
  }
  
  console.log("Sleeping for 30 seconds initially...");
  await new Promise(resolve => setTimeout(resolve, 31000));

  console.log(`Generating embeddings for ${postsToEmbed.length} posts...`);
  
  const BATCH_SIZE = 50;
  for (let i = 0; i < postsToEmbed.length; i += BATCH_SIZE) {
    const chunk = postsToEmbed.slice(i, i + BATCH_SIZE);
    
    // Create an array of strings as `contents`. Wait, how is array of strings supported?
    // According to SDK, embedContent can take single string or object. What if we just loop for each? Or can we pass an array?
    // Gemini SDK documentation for `embedContent` (batch) is not shown. 
    // I'll do Promise.all with individual calls to be safe.
    
    console.log(`Processing batch ${Math.floor(i/BATCH_SIZE) + 1}...`);
    await Promise.all(chunk.map(async (post) => {
      try {
        const textToEmbed = `Title: ${post.title}\nDescription: ${post.excerpt}\nCategory: ${post.category}`;
        const resp = await ai.models.embedContent({
          model: 'gemini-embedding-2-preview',
          contents: textToEmbed,
        });
        if (resp.embeddings && resp.embeddings.length > 0 && resp.embeddings[0].values) {
          embeddings[post.id] = resp.embeddings[0].values;
        }
      } catch(e) {
        console.error("Error embedding post:", post.id, e);
      }
    }));
    
    fs.writeFileSync(embeddingsFile, JSON.stringify(embeddings, null, 2));
    // rate limiting just in case
    console.log("Sleeping to avoid rate limits...");
    await new Promise(r => setTimeout(r, 60000));
  }
  
  console.log("Done generating embeddings.");
}

main().catch(console.error);
