import { POSTS } from './src/data/posts';
const mapped = new Set(POSTS.map(p => p.slug || p.id));
console.log("Unique keys:", mapped.size);
