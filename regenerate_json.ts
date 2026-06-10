import { POSTS } from './src/data/posts.ts';
import fs from 'fs';

const jsonString = JSON.stringify(POSTS, null, 2);

fs.writeFileSync('public/data/articles.json', jsonString, 'utf8');
fs.writeFileSync('src/data/articles.json', jsonString, 'utf8');

console.log('Successfully regenerated articles.json at public/data/articles.json and src/data/articles.json with unique banners!');
