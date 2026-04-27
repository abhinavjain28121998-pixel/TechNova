import fs from 'fs';
const files = ['public/sitemap.xml', 'public/rss.xml'];
files.forEach(f => {
  if (fs.existsSync(f)) {
    const t = fs.readFileSync(f, 'utf8');
    fs.writeFileSync(f, t.replace(/tech-nova-iota\.vercel\.app/g, 'www.thehackettgroup.com'));
  }
});
