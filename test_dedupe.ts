import { POSTS } from './src/data/posts';
const uniqueSlugs = new Set();
for (const p of POSTS) {
  if (uniqueSlugs.has(p.slug)) {
    console.log('Duplicate slug:', p.slug, 'id:', p.id);
  }
  uniqueSlugs.add(p.slug);
}
console.log('Total POSTS:', POSTS.length);
