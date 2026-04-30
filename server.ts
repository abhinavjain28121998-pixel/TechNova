import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API routes FIRST
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Load Firebase Config conditionally
  const firebaseConfigPath = path.resolve(__dirname, 'firebase-applet-config.json');
  let db = null;
  if (fs.existsSync(firebaseConfigPath)) {
    try {
      const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf-8'));
      const firebaseApp = initializeApp(firebaseConfig);
      db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
    } catch (e) {
      console.error("Failed to initialize Firebase in server:", e);
    }
  }

  const isProd = process.env.NODE_ENV === 'production';

  let vite;
  if (!isProd) {
    // Vite middleware for development
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve dist assets
    const distPath = path.join(process.cwd(), 'dist');
    // Important: we serve static files EXCEPT index.html so our catch-all below processes it
    app.use(express.static(distPath, { index: false }));
  }

  // Catch-all to inject dynamic SEO metadata
  app.get('*', async (req, res, next) => {
    try {
      const url = req.originalUrl;
      let template = '';
      
      if (!isProd) {
        template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
      } else {
        template = fs.readFileSync(path.resolve(__dirname, 'dist/index.html'), 'utf-8');
      }

      // Inject canonical URL globally for all routes
      const baseUrl = 'https://tech-nova-iota.vercel.app';
      let cleanPath = url.split('?')[0].split('#')[0];
      if (cleanPath.length > 1 && cleanPath.endsWith('/')) {
        cleanPath = cleanPath.slice(0, -1);
      }
      const canonicalUrl = `${baseUrl}${cleanPath === '/' ? '' : cleanPath}`;
      
      if (template.includes('<link rel="canonical"')) {
        template = template.replace(
          /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
          `<link rel="canonical" href="${canonicalUrl}" />`
        );
      } else {
        template = template.replace('</head>', `<link rel="canonical" href="${canonicalUrl}" />\n</head>`);
      }

      let jsonLdScript = '';

      try {
        const { generateOrganizationSchema, generateWebSiteSchema } = await import('./src/lib/seo.ts');
        const genericSchemas = [generateOrganizationSchema(), generateWebSiteSchema()];

        // Check if trying to view a blog post
        const blogMatch = url.match(/^\/blog\/([^/?#&]+)/);
        if (blogMatch) {
          const slug = blogMatch[1];
          let postData: any = null;
          
          if (db) {
            const postsRef = collection(db, 'posts');
            const q = query(postsRef, where('slug', '==', slug));
            const snap = await getDocs(q);
            if (!snap.empty) {
              postData = snap.docs[0].data();
            }
          }
          
          if (!postData) {
            // Fallback to local posts data
            const { POSTS } = await import('./src/data/posts.ts');
            postData = POSTS.find((p: any) => p.slug === slug);
          }
          
          if (postData) {
            const siteName = 'TechNova';
            const title = postData.title.includes(siteName) ? postData.title : `${postData.title} | ${siteName}`;
            const description = postData.metaDescription || postData.excerpt || title;
            const image = postData.coverImage || 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop';

            const { generateBlogPostGraphSchema } = await import('./src/lib/seo.ts');
            const schema = generateBlogPostGraphSchema(postData);
            jsonLdScript = `\n<script type="application/ld+json">\n${JSON.stringify(schema)}\n</script>\n`;

            template = template.replace(/<title>.*?<\/title>/i, `<title>${title}</title>`);
            
            if (template.includes('<meta name="description"')) {
              template = template.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, `<meta name="description" content="${description}" />`);
            } else {
              template = template.replace('</head>', `<meta name="description" content="${description}" />\n</head>`);
            }

            const ogTags = `
              <meta property="og:title" content="${title}" />
              <meta property="og:description" content="${description}" />
              <meta property="og:image" content="${image}" />
              <meta property="og:type" content="article" />
              <meta name="twitter:card" content="summary_large_image" />
              <meta name="twitter:title" content="${title}" />
              <meta name="twitter:description" content="${description}" />
              <meta name="twitter:image" content="${image}" />${jsonLdScript}
            `;
            template = template.replace('</head>', `${ogTags}\n</head>`);
          }
        } else if (url.startsWith('/blog')) {
          // Blog List Page
          const { BASE_URL, generateBreadcrumbSchema } = await import('./src/lib/seo.ts');
          
          let postsList: any[] = [];
          if (db) {
            try {
              const postsRef = collection(db, 'posts');
              const snap = await getDocs(postsRef);
              postsList = snap.docs.map(d => d.data());
            } catch (e) {}
          }
          if (postsList.length === 0) {
            const { POSTS } = await import('./src/data/posts.ts');
            postsList = POSTS;
          }
          
          genericSchemas.push(generateBreadcrumbSchema([
            { name: 'Home', item: '/' },
            { name: 'Blog', item: '/blog' }
          ]));
          
          const blogListSchema = {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            'itemListElement': postsList.slice(0, 10).map((post: any, index: number) => ({
              '@type': 'ListItem',
              'position': index + 1,
              'url': `${BASE_URL}/blog/${post.slug}`
            }))
          };
          genericSchemas.push(blogListSchema);
          jsonLdScript = `\n<script type="application/ld+json">\n${JSON.stringify(genericSchemas)}\n</script>\n`;
          template = template.replace('</head>', `${jsonLdScript}\n</head>`);
        } else {
          // All other pages (Home, About, Contact)
          jsonLdScript = `\n<script type="application/ld+json">\n${JSON.stringify(genericSchemas)}\n</script>\n`;
          template = template.replace('</head>', `${jsonLdScript}\n</head>`);
        }
      } catch (e) {
        console.error("Error generating schema:", e);
      }

      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      if (!isProd && vite) {
        vite.ssrFixStacktrace(e);
      }
      console.log(e.stack);
      res.status(500).end(e.stack);
    }
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
