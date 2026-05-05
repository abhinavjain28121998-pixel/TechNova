const fs = require('fs');
const https = require('https');

const files = ['src/data/eeatPosts.ts', 'src/data/posts.ts', 'src/data/transformationPosts.ts', 'src/data/moreTransformationPosts.ts'];
const imageUrls = new Set();
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const matches = content.match(/https:\/\/images.unsplash.com\/photo-[^?']+\?auto=format&fit=crop&q=80&w=1200/g);
  if (matches) {
    matches.forEach(m => imageUrls.add(m));
  }
});

async function checkImage(url) {
  return new Promise((resolve) => {
    const req = https.request(url, { method: 'HEAD', timeout: 3000 }, (res) => {
      resolve({ url, status: res.statusCode });
    });
    req.on('timeout', () => {
      req.destroy();
      resolve({ url, status: 'timeout' });
    });
    req.on('error', (e) => {
      resolve({ url, status: e.message });
    });
    req.end();
  });
}

async function run() {
  console.log(`Checking ${imageUrls.size} images...`);
  const urls = Array.from(imageUrls);
  const chunks = [];
  for (let i = 0; i < urls.length; i += 5) {
    chunks.push(urls.slice(i, i + 5));
  }
  
  const failed = [];
  for (const chunk of chunks) {
    const results = await Promise.all(chunk.map(checkImage));
    for (const r of results) {
        if (typeof r.status === 'number' && r.status !== 200) {
            console.log(`Failed: ${r.url} (Status: ${r.status})`);
            failed.push(r.url);
        } else if (typeof r.status !== 'number') {
            console.log(`Failed/Timeout: ${r.url} (Status: ${r.status})`);
            failed.push(r.url);
        } else {
            console.log(`OK: ${r.url}`);
        }
    }
  }
  fs.writeFileSync('failed_images.json', JSON.stringify(failed, null, 2));
  console.log('Done checking images.');
}

run();
