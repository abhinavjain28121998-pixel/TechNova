import fs from 'fs';
import path from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { POSTS } from './src/data/posts.ts';
import {
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateBlogPostGraphSchema,
  generateBreadcrumbSchema,
  generateAboutPageSchema,
  generateContactPageSchema,
  BASE_URL
} from './src/lib/seo.ts';

const distDir = path.resolve(process.cwd(), 'dist');

if (!fs.existsSync(distDir)) {
  console.error("No dist directory found. Ensure this runs after build.");
  process.exit(1);
}

// Ensure dist/blog exists
const distBlogDir = path.join(distDir, 'blog');
if (!fs.existsSync(distBlogDir)) {
  fs.mkdirSync(distBlogDir, { recursive: true });
}

// Prepare Firebase
let db = null;
const firebaseConfigPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
if (fs.existsSync(firebaseConfigPath)) {
  try {
    const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf8'));
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  } catch (e) {
    console.error("Failed to initialize Firebase in prerender_seo:", e);
  }
}

async function createPreRenderedPage(outputFilePath, title, description, urlStr, image, ogType = 'website', jsonLds = []) {
  try {
    let html = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');

    // canonical
    let canonicalUrl = urlStr.endsWith('/') && urlStr.length > 1 ? urlStr.slice(0, -1) : urlStr;
    const { pathname } = new URL(canonicalUrl);

    // standard replacements
    if (html.includes('<title>')) {
      html = html.replace(/<title>.*?<\/title>/i, `<title>${title}</title>`);
    } else {
      html = html.replace('</head>', `<title>${title}</title>\n</head>`);
    }

    if (html.includes('<meta name="description"')) {
      html = html.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, `<meta name="description" content="${description}" />`);
    } else {
      html = html.replace('</head>', `<meta name="description" content="${description}" />\n</head>`);
    }

    // append canonical and schemas
    const schemaScript = `\n<script type="application/ld+json">\n${JSON.stringify(jsonLds)}\n</script>\n`;

    const ogTags = `
      <link rel="canonical" href="${canonicalUrl}" />
      <meta property="og:title" content="${title}" />
      <meta property="og:description" content="${description}" />
      <meta property="og:image" content="${image}" />
      <meta property="og:type" content="${ogType}" />
      <meta property="og:url" content="${canonicalUrl}" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="${title}" />
      <meta name="twitter:description" content="${description}" />
      <meta name="twitter:image" content="${image}" />${schemaScript}
    `;

    html = html.replace('</head>', `${ogTags}\n</head>`);

    // Ensure parent directories exist
    const outDir = path.dirname(outputFilePath);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    fs.writeFileSync(outputFilePath, html, 'utf-8');
    // console.log(`✓ Pre-rendered: ${pathname}`);
  } catch (e) {
    console.error(`Failed to prerender ${urlStr}:`, e);
  }
}

async function run() {
  const genericSchemas = [generateOrganizationSchema(), generateWebSiteSchema()];
  const defaultImage = 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop';
  const siteName = 'TechNova';

  // 1. Gather all posts
  const allPosts = new Map();
  POSTS.forEach(post => allPosts.set(post.slug, post));
  
  if (db) {
    const postsRef = collection(db, 'posts');
    const snap = await getDocs(query(postsRef));
    snap.forEach(doc => {
      const data = doc.data();
      if (data.slug) {
        allPosts.set(data.slug, { id: doc.id, ...data });
      }
    });
  }

  // 2. Output each post
  const postsList = Array.from(allPosts.values()).filter(p => p.status !== 'draft');
  
  for (const post of postsList) {
    const title = post.title.includes(siteName) ? post.title : `${post.title} | ${siteName}`;
    const description = post.metaDescription || post.excerpt || post.title;
    const image = post.coverImage || defaultImage;
    const url = `${BASE_URL}/blog/${post.slug}`;
    
    const postSchema = generateBlogPostGraphSchema(post);

    const postDir = path.join(distBlogDir, post.slug);
    if (!fs.existsSync(postDir)) fs.mkdirSync(postDir, { recursive: true });

    await createPreRenderedPage(
      path.join(postDir, 'index.html'),
      title,
      description,
      url,
      image,
      'article',
      postSchema // already outputs @context and @graph
    );
  }

  // 3. Output Blog List Page
  const blogListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'itemListElement': postsList.slice(0, 10).map((post, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'url': `${BASE_URL}/blog/${post.slug}`
    }))
  };
  
  const blogBreadcrumbs = generateBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Blog', item: '/blog' }
  ]);

  const blogListGraph = {
    '@context': 'https://schema.org',
    '@graph': [...genericSchemas, blogBreadcrumbs, blogListSchema]
  };

  await createPreRenderedPage(
    path.join(distBlogDir, 'index.html'),
    `Blog | ${siteName}`,
    'Browse all our technology articles, tutorials, and insights.',
    `${BASE_URL}/blog`,
    defaultImage,
    'website',
    blogListGraph
  );

  // 4. Output Home
  await createPreRenderedPage(
    path.join(distDir, 'index.html'), // update root index
    `${siteName} Blog | Modern Technology Insights`,
    'TechNova Blog - Decoding the Future of Technology. Expert analysis, tutorials, and insights on AI, web development, and software.',
    `${BASE_URL}/`,
    defaultImage,
    'website',
    { '@context': 'https://schema.org', '@graph': genericSchemas }
  );

  console.log(`Pre-rendering complete. Total posts: ${postsList.length}`);
}

run().catch(console.error);
