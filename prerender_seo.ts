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

function getOptimizedImageUrl(url: string | undefined, width: number = 800): string {
  const fallback = 'https://images.unsplash.com/photo-1504384308090-c894fd10fdd2?q=75&w=' + width + '&auto=format&fit=crop';
  if (!url) return fallback;
  if (url.includes('images.unsplash.com')) {
    try {
      const urlObj = new URL(url);
      urlObj.searchParams.set('w', width.toString());
      urlObj.searchParams.set('q', '75');
      urlObj.searchParams.set('auto', 'format');
      if (!urlObj.searchParams.has('fit')) {
        urlObj.searchParams.set('fit', 'crop');
      }
      return urlObj.toString();
    } catch (e) {
      return url;
    }
  }
  return url;
}

async function createPreRenderedPage(outputFilePath, title, description, urlStr, image, ogType = 'website', jsonLd: any = null, preloadImg = '') {
  try {
    let html = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');

    // canonical
    let canonicalUrl = urlStr.endsWith('/') && urlStr.length > 1 ? urlStr.slice(0, -1) : urlStr;
    const { pathname } = new URL(canonicalUrl);

    // standard replacements
    if (html.includes('<title data-rh="true">')) {
      html = html.replace(/<title data-rh="true">.*?<\/title>/i, `<title data-rh="true">${title}</title>`);
    } else if (html.includes('<title>')) {
      html = html.replace(/<title>.*?<\/title>/i, `<title data-rh="true">${title}</title>`);
    } else {
      html = html.replace('</head>', `<title data-rh="true">${title}</title>\n</head>`);
    }

    if (html.includes('<meta name="description"')) {
      html = html.replace(/<meta\s+(?:data-rh="true"\s+)?name="description"\s+content="[^"]*"\s*(?:data-rh="true"\s*)?\/?>/i, `<meta name="description" content="${description}" data-rh="true" />`);
    } else {
      html = html.replace('</head>', `<meta name="description" content="${description}" data-rh="true" />\n</head>`);
    }

    // append canonical and schemas
    const schemaScript = jsonLd ? `\n<script type="application/ld+json" data-rh="true">\n${JSON.stringify(jsonLd)}\n</script>\n` : '';
    const preloadTag = preloadImg ? `<link rel="preload" as="image" href="${preloadImg}" fetchpriority="high" />\n` : '';

    const ogTags = `
      ${preloadTag}<link rel="canonical" href="${canonicalUrl}" data-rh="true" />
      <meta property="og:title" content="${title}" data-rh="true" />
      <meta property="og:description" content="${description}" data-rh="true" />
      <meta property="og:image" content="${image}" data-rh="true" />
      <meta property="og:type" content="${ogType}" data-rh="true" />
      <meta property="og:url" content="${canonicalUrl}" data-rh="true" />
      <meta property="og:site_name" content="TechNova" data-rh="true" />
      <meta name="application-name" content="TechNova" data-rh="true" />
      <meta name="twitter:card" content="summary_large_image" data-rh="true" />
      <meta name="twitter:title" content="${title}" data-rh="true" />
      <meta name="twitter:description" content="${description}" data-rh="true" />
      <meta name="twitter:image" content="${image}" data-rh="true" />${schemaScript}
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
    const preloadImgUrl = getOptimizedImageUrl(post.coverImage || defaultImage, 800);

    await createPreRenderedPage(
      path.join(distBlogDir, `${post.slug}.html`),
      title,
      description,
      url,
      image,
      'article',
      postSchema,
      preloadImgUrl
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
    path.join(distDir, 'blog.html'),
    `Blog Post Archive & Tech Tutorials | ${siteName}`,
    'Browse all our technology articles, tutorials, and insights.',
    `${BASE_URL}/blog`,
    defaultImage,
    'website',
    blogListGraph
  );

  // 4. Output Home
  const posts = postsList.filter((p: any) => p.status === 'published' || !p.status);
  const featuredPosts = posts.filter((post: any) => post.featured);
  const carouselPosts = featuredPosts.length > 0 ? featuredPosts : posts.slice(0, 3);
  const firstPost = carouselPosts[0];
  const homePreloadImg = getOptimizedImageUrl(firstPost ? firstPost.coverImage : defaultImage, 800);

  await createPreRenderedPage(
    path.join(distDir, 'index.html'), // update root index
    `${siteName} | Decoding the Future of AI & Technology`,
    'TechNova Blog - Decoding the Future of Technology. Expert analysis, tutorials, and insights on AI, web development, and software.',
    `${BASE_URL}/`,
    defaultImage,
    'website',
    { '@context': 'https://schema.org', '@graph': genericSchemas },
    homePreloadImg
  );

  // 5. Output Static Pages
  // About Page
  const aboutSchema = generateAboutPageSchema();
  const aboutBreadcrumb = generateBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'About', item: '/about' }
  ], `${BASE_URL}/about/#breadcrumb`);
  await createPreRenderedPage(
    path.join(distDir, 'about.html'),
    `About | Our Mission & Editorial Values | ${siteName}`,
    'Discover the story behind TechNova. We are a team of tech industry practitioners delivering deep research, tutorials, and practical insights.',
    `${BASE_URL}/about`,
    defaultImage,
    'website',
    { '@context': 'https://schema.org', '@graph': [...genericSchemas, aboutBreadcrumb, aboutSchema] }
  );

  // Contact Page
  const contactSchema = generateContactPageSchema();
  const contactBreadcrumb = generateBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Contact', item: '/contact' }
  ], `${BASE_URL}/contact/#breadcrumb`);
  await createPreRenderedPage(
    path.join(distDir, 'contact.html'),
    `Contact TechNova | Feedback & Collaborations | ${siteName}`,
    'Get in touch with the TechNova editorial and support team. We value your feedback, pitches, and tech enquiries.',
    `${BASE_URL}/contact`,
    defaultImage,
    'website',
    { '@context': 'https://schema.org', '@graph': [...genericSchemas, contactBreadcrumb, contactSchema] }
  );

  // Case Studies Page
  const caseStudiesSchema = {
    '@type': 'CollectionPage',
    '@id': `${BASE_URL}/case-studies/#webpage`,
    url: `${BASE_URL}/case-studies`,
    name: `Case Studies & Deep-Dive Client Success Stories`,
    description: 'Explore real-world technical and business case studies, showing applied AI, Cloud transformation, and structural software designs.',
    isPartOf: { '@id': `${BASE_URL}/#website` }
  };
  const caseStudiesBreadcrumb = generateBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Case Studies', item: '/case-studies' }
  ], `${BASE_URL}/case-studies/#breadcrumb`);
  await createPreRenderedPage(
    path.join(distDir, 'case-studies.html'),
    `Case Studies & Applied Enterprise AI Projects | ${siteName}`,
    'Dive deep into our real-world transformation case studies, depicting advanced AI architectures, enterprise procurement, and high-performance engineering.',
    `${BASE_URL}/case-studies`,
    defaultImage,
    'website',
    { '@context': 'https://schema.org', '@graph': [...genericSchemas, caseStudiesBreadcrumb, caseStudiesSchema] }
  );

  // Privacy Policy Page
  const privacySchema = {
    '@type': 'WebPage',
    '@id': `${BASE_URL}/privacy/#webpage`,
    url: `${BASE_URL}/privacy`,
    name: 'Privacy Policy',
    description: 'Read the privacy policy of TechNova Blog to understand how we protect visitor data.',
    isPartOf: { '@id': `${BASE_URL}/#website` }
  };
  const privacyBreadcrumb = generateBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Privacy Policy', item: '/privacy' }
  ], `${BASE_URL}/privacy/#breadcrumb`);
  await createPreRenderedPage(
    path.join(distDir, 'privacy.html'),
    `Privacy Policy | Data Security & Compliance | ${siteName}`,
    'Learn how TechNova handles, processes, and protects your user information. Read our full data privacy principles and browser cookie guidelines.',
    `${BASE_URL}/privacy`,
    defaultImage,
    'website',
    { '@context': 'https://schema.org', '@graph': [...genericSchemas, privacyBreadcrumb, privacySchema] }
  );

  // Terms of Service Page
  const termsSchema = {
    '@type': 'WebPage',
    '@id': `${BASE_URL}/terms/#webpage`,
    url: `${BASE_URL}/terms`,
    name: 'Terms of Service',
    description: 'Read the terms and conditions for using TechNova Blog.',
    isPartOf: { '@id': `${BASE_URL}/#website` }
  };
  const termsBreadcrumb = generateBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Terms of Service', item: '/terms' }
  ], `${BASE_URL}/terms/#breadcrumb`);
  await createPreRenderedPage(
    path.join(distDir, 'terms.html'),
    `Terms of Service & Usage Agreement | ${siteName}`,
    'Review the terms of service, editorial policies, and usage agreement governing the content on the TechNova platform.',
    `${BASE_URL}/terms`,
    defaultImage,
    'website',
    { '@context': 'https://schema.org', '@graph': [...genericSchemas, termsBreadcrumb, termsSchema] }
  );

  console.log(`Pre-rendering complete. Total posts: ${postsList.length}`);
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
