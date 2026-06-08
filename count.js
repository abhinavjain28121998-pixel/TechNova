import fs from 'fs';

const posts = fs.readFileSync('all_posts.txt', 'utf8');
const lines = posts.split('\n').filter(line => line.includes('Cover Image:'));
const counts = {};
lines.forEach(line => {
  const img = line.replace('Cover Image:', '').trim();
  counts[img] = (counts[img] || 0) + 1;
});
const sorted = Object.entries(counts).sort((a,b) => b[1] - a[1]);
console.log(sorted.slice(0, 20));
