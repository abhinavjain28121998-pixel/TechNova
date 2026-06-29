import { POSTS } from './src/data/posts';
const posts = POSTS.filter(p => p.slug === 'small-language-models-enterprise-ai');
console.log('Count in POSTS:', posts.length);
