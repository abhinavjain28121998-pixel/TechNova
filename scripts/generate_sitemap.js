import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { POSTS } from '../src/data/posts.ts';

const firebaseConfigPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const baseUrl = process.env.VITE_SITE_URL || 'https://tech-nova-iota.vercel.app';

async function generateSitemapAndRSS() {
  const postsRef = collection(db, 'posts');
  const q = query(postsRef, orderBy('date', 'desc'));
  const snap = await getDocs(q);
  
  const today = new Date().toISOString().split('T')[0];

  const caseStudiesModule = await import('../src/data/caseStudiesData.tsx');
  const caseStudies = caseStudiesModule.caseStudies || [];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
  </url>
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${today}</lastmod>
  </url>
  <url>
    <loc>${baseUrl}/case-studies</loc>
    <lastmod>${today}</lastmod>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
    <lastmod>${today}</lastmod>
  </url>
  <url>
    <loc>${baseUrl}/contact</loc>
    <lastmod>${today}</lastmod>
  </url>
  <url>
    <loc>${baseUrl}/privacy</loc>
    <lastmod>${today}</lastmod>
  </url>
  <url>
    <loc>${baseUrl}/terms</loc>
    <lastmod>${today}</lastmod>
  </url>
`;

  caseStudies.forEach(study => {
    xml += `  <url>
    <loc>${baseUrl}/case-studies/${study.slug}</loc>
    <lastmod>${today}</lastmod>
  </url>\n`;
  });


  let rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>TechNova Blog</title>
  <description>Expert analysis, tutorials, and deep-dive insights on Artificial Intelligence, Web Development, and Tech.</description>
  <link>${baseUrl}</link>
  <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
`;

  const allPosts = new Map();
  POSTS.forEach(post => allPosts.set(post.id || post.slug, post));
  
  // Read from articles.json as well
  try {
    const articlesJson = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'public/data/articles.json'), 'utf8'));
    articlesJson.forEach(post => allPosts.set(post.id || post.slug, post));
  } catch(e) {
    console.warn("Could not read articles.json", e.message);
  }
  
  snap.forEach(doc => {
    allPosts.set(doc.id, { id: doc.id, ...doc.data() });
  });

  Array.from(allPosts.values()).forEach(data => {
    if (data.status === 'draft') return; // Skip drafts

    // Use the post date if available, otherwise today
    const postDate = data.date ? new Date(data.date) : new Date();
    const formattedDate = postDate.toISOString().split('T')[0];
    const pubDate = postDate.toUTCString();

    xml += `  <url>
    <loc>${baseUrl}/blog/${data.slug}</loc>
    <lastmod>${formattedDate}</lastmod>
  </url>\n`;

    rss += `  <item>
    <title><![CDATA[${data.title}]]></title>
    <description><![CDATA[${data.excerpt || ''}]]></description>
    <link>${baseUrl}/blog/${data.slug}</link>
    <guid>${baseUrl}/blog/${data.slug}</guid>
    <pubDate>${pubDate}</pubDate>
  </item>\n`;
  });

  xml += "</urlset>";
  rss += "</channel>\n</rss>";

  fs.writeFileSync(path.resolve(process.cwd(), 'public/sitemap.xml'), xml);
  fs.writeFileSync(path.resolve(process.cwd(), 'public/rss.xml'), rss);
  console.log("Sitemap and RSS generated successfully with " + Array.from(allPosts.values()).filter(d => d.status !== 'draft').length + " posts.");
  process.exit(0);
}

generateSitemapAndRSS().catch((e) => {
  console.error(e);
  process.exit(1);
});
