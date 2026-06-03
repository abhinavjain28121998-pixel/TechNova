import { getPosts } from './postService';

async function test() {
  const posts = await getPosts();
  console.log("Firebase posts length:", posts.length);
  const slugs = ['gen-ai-revenue-leakage-detection', 'gen-ai-procurement-to-pay-automation', 'gen-ai-internal-knowledge-management', 'gen-ai-board-investor-report-generation'];
  const found = posts.filter(p => slugs.includes(p.slug));
  console.log("Found SEO articles:", found.map(p => p.slug));
  process.exit(0);
}

test();
