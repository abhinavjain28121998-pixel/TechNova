import fs from 'fs';
import path from 'path';
import { POSTS } from '../src/data/posts.ts';
import crypto from 'crypto';

const dataDir = path.resolve(process.cwd(), 'src/data');

const semanticBridges = [
  "Understanding how this interconnects with {{topic}} can provide deeper strategic clarity.",
  "This approach perfectly complements broader initiatives in {{topic}}.",
  "For organizations scaling these capabilities, aligning with {{topic}} becomes highly critical.",
  "Many leaders integrating these systems also explore synergies with {{topic}}.",
  "The underlying principles here strongly parallel the advancements seen across {{topic}}.",
  "Expanding this framework often requires a foundational grasp of {{topic}}.",
  "It is also worth noting how these mechanisms drive outcomes in {{topic}}."
];

function replaceWithTracking(content, myPostId) {
  let newContent = content;
  
  // See how many markdown links exist
  const existingLinks = (newContent.match(/\]\(\/blog\//g) || []).length;
  
  if (existingLinks >= 6) return newContent; // well-linked already

  // Find target posts related to this post
  const myPost = POSTS.find(p => p.id === myPostId || p.slug === myPostId) || POSTS[Math.floor(Math.random() * POSTS.length)];
  
  // Pick targets that share category or tags, but aren't the same
  let targets = POSTS.filter(p => p.id !== myPost.id && p.slug !== myPost.slug && p.category === myPost.category);
  if (targets.length === 0) targets = POSTS.filter(p => p.id !== myPost.id);
  
  targets = targets.sort(() => Math.random() - 0.5);
  
  const paragraphs = newContent.split('\n\n');
  let injected = 0;
  
  for (let i = 2; i < paragraphs.length; i += 3) {
    if (injected >= 2) break; // max 2 bridges
    let para = paragraphs[i];
    if (para.startsWith('#') || para.startsWith('>') || para.startsWith('-') || para.startsWith('*') || para.startsWith('```')) continue;
    
    const target = targets.pop();
    if (!target) break;

    // Pick top phrase representing the target
    const topicTags = target.tags && target.tags.length > 0 ? target.tags : [target.title];
    const targetTopic = topicTags[Math.floor(Math.random() * topicTags.length)];
    
    const bridgeTemplate = semanticBridges[Math.floor(Math.random() * semanticBridges.length)];
    const bridgeText = bridgeTemplate.replace('{{topic}}', `[${targetTopic.toLowerCase()}](/blog/${target.slug})`);
    
    paragraphs[i] = para.trim() + " " + bridgeText;
    injected++;
  }
  
  return paragraphs.join('\n\n');
}

async function main() {
  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.ts') && f !== 'posts.ts' && f !== 'authors.ts');
  
  for (const file of files) {
    const filePath = path.join(dataDir, file);
    let fileSource = fs.readFileSync(filePath, 'utf8');
    
    let currentId = file.replace('.ts', '');
    
    const blockRegex = /(content\s*:\s*`)([\s\S]*?)(`)/g;
    
    let hasChanges = false;
    fileSource = fileSource.replace(blockRegex, (match, prefix, content, suffix) => {
      const newContent = replaceWithTracking(content, currentId);
      if (newContent !== content) hasChanges = true;
      return prefix + newContent + suffix;
    });
    
    if (hasChanges) {
      fs.writeFileSync(filePath, fileSource, 'utf8');
      console.log(`Injected bridging links in ${file}`);
    }
  }
}

main().catch(console.error);
