import fs from 'fs';

async function test() {
  const html = await fetch('https://unsplash.com/s/photos/artificial-intelligence').then(r => r.text());
  const matches = [...html.matchAll(/"(photo-[a-zA-Z0-9-]+)"/g)];
  console.log(matches.slice(0, 5).map(m => m[1]));
}
test();
