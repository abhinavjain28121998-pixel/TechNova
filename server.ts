import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { GoogleGenAI } from '@google/genai';
import compression from 'compression';

// Global embeddings cache
let postEmbeddings = {};
try {
  const embeddingsPath = path.resolve(process.cwd(), 'src/data/embeddings.json');
  if (fs.existsSync(embeddingsPath)) {
    postEmbeddings = JSON.parse(fs.readFileSync(embeddingsPath, 'utf8'));
  }
} catch (e) {
  console.error("Failed to load embeddings", e);
}

// Cosine similarity helpers
function dotProduct(a: number[], b: number[]) {
  return a.reduce((sum, val, i) => sum + val * b[i], 0);
}
function magnitude(a: number[]) {
  return Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
}
function cosineSimilarity(a: number[], b: number[]) {
  return dotProduct(a, b) / (magnitude(a) * magnitude(b));
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

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Enable Gzip/Brotli compression for all Express payloads
  app.use(compression());

  // Add middleware to parse JSON
  app.use(express.json());

  // API routes FIRST
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.post('/api/semantic-search', async (req, res) => {
    try {
      const { q } = req.body;
      if (!q || typeof q !== 'string') {
        return res.json({ results: [] });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not set' });
      }

      const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const response = await ai.models.embedContent({
        model: 'gemini-embedding-2-preview',
        contents: q,
      });

      const queryEmbedding = response.embeddings?.[0]?.values;
      if (!queryEmbedding) {
        return res.status(500).json({ error: 'Failed to generate query embedding' });
      }

      const results = Object.keys(postEmbeddings).map(postId => {
        const postEmb = postEmbeddings[postId];
        const score = cosineSimilarity(queryEmbedding, postEmb);
        return { id: postId, score };
      });

      // Filter out low scores and sort
      results.sort((a, b) => b.score - a.score);
      const topResults = results.slice(0, 20);

      res.json({ results: topResults });
    } catch (e) {
      console.error("Semantic search error:", e);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/generate-alt', async (req, res) => {
    try {
      const { src, context } = req.body;
      if (!src) {
        return res.status(400).json({ error: 'src parameter is required' });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not set' });
      }

      const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const imageResp = await fetch(src);
      if (!imageResp.ok) {
        throw new Error(`HTTP error! status: ${imageResp.status}`);
      }
      const arrayBuffer = await imageResp.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      const mimeType = imageResp.headers.get('content-type') || 'image/jpeg';

      const prompt = `Provide a concise, descriptive alt text for this image to be used by screen readers in a blog post.
      Article context: ${context?.substring(0, 300) || 'General technology article'}.
      Respond ONLY with the alt text, no quotes or explanations.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: {
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: base64,
                mimeType: mimeType
              }
            }
          ]
        }
      });

      res.json({ text: response.text?.trim() || '' });
    } catch (e) {
      console.error("Alt text generation error:", e);
      res.status(500).json({ error: 'Failed to generate alt text' });
    }
  });

  app.post('/api/tts', async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: 'text parameter is required' });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not set' });
      }

      const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: text }] }],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Kore' },
              },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) {
        throw new Error('No audio generated');
      }

      res.json({ audio: base64Audio });
    } catch (e) {
      console.error("TTS generation error:", e);
      res.status(500).json({ error: 'Failed to generate audio' });
    }
  });

  // Load Firebase Config conditionally
  const firebaseConfigPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
  let db = null;
  if (fs.existsSync(firebaseConfigPath)) {
    try {
      const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf-8'));
      const firebaseApp = initializeApp(firebaseConfig);
      db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId || '(default)');
    } catch (e) {
      console.error("Failed to initialize Firebase in server:", e);
    }
  }

  // Determine if we are in production. The bundled server always outputs to dist/server.cjs
  const isProd = process.env.NODE_ENV === 'production' || (typeof __filename !== 'undefined' && __filename.endsWith('server.cjs'));

  let vite;
  if (!isProd) {
    // Dynamic import to prevent crash in production when vite is not installed
    const viteModule = await import('vite');
    const createViteServer = viteModule.createServer;
    // Vite middleware for development
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve dist assets with caching for immutable assets
    const distPath = path.join(process.cwd(), 'dist');
    app.use('/assets', express.static(path.join(distPath, 'assets'), { maxAge: '1y', immutable: true }));
    // Important: we serve static files EXCEPT index.html so our catch-all below processes it
    app.use(express.static(distPath, { index: false }));
  }

  // Sitemap generation
  app.get('/sitemap.xml', async (req, res) => {
    try {
      let postsList: any[] = [];
      if (db) {
        try {
          const postsRef = collection(db, 'posts');
          const snap = await getDocs(postsRef);
          postsList = snap.docs.map(d => d.data());
        } catch (e) {
          console.error("Firestore read error for sitemap:", e);
        }
      }
      if (postsList.length === 0) {
        const { POSTS } = await import('./src/data/posts.ts');
        postsList = [...POSTS];
        try {
          const articlesJson = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'public/data/articles.json'), 'utf8'));
          postsList = [...postsList, ...articlesJson];
        } catch(e) {}
      }

      const publishedPosts = postsList.filter((p: any) => !p.status || p.status === 'published');
      const baseUrl = process.env.VITE_SITE_URL || 'https://tech-nova-iota.vercel.app';
      
      const staticPages = [
        '',
        '/about',
        '/case-studies',
        '/blog',
        '/contact',
        '/privacy',
        '/terms'
      ];

      const { caseStudies } = await import('./src/data/caseStudiesData.tsx');

      res.setHeader('Content-Type', 'application/xml');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(page => `  <url>
    <loc>${baseUrl}${page}</loc>
    <changefreq>${page === '/blog' || page === '' ? 'daily' : 'weekly'}</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')}
${publishedPosts.map((post: any) => `  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${new Date(post.date || Date.now()).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}
${caseStudies.map((study: any) => `  <url>
    <loc>${baseUrl}/case-studies/${study.slug}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;

      res.status(200).send(sitemap.trim());
    } catch (error) {
      console.error('Error generating sitemap', error);
      res.status(500).end();
    }
  });

  // Catch-all to inject dynamic SEO metadata
  app.get('*', async (req, res, next) => {
    try {
      const url = req.originalUrl;
      let template = '';
      
      if (!isProd) {
        template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
      } else {
        template = fs.readFileSync(path.resolve(process.cwd(), 'dist/index.html'), 'utf-8');
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
          /<link\s+(?:data-rh="true"\s+)?rel="canonical"\s+href="[^"]*"\s*(?:data-rh="true"\s*)?\/?>/i,
          `<link rel="canonical" href="${canonicalUrl}" data-rh="true" />`
        );
      } else {
        template = template.replace('</head>', `<link rel="canonical" href="${canonicalUrl}" data-rh="true" />\n</head>`);
      }

      let jsonLdScript = '';

      try {
        const { generateOrganizationSchema, generateWebSiteSchema } = await import('./src/lib/seo.ts');
        const genericSchemas: any[] = [generateOrganizationSchema(), generateWebSiteSchema()];

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
            
            if (!postData) {
              try {
                const articlesJson = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'public/data/articles.json'), 'utf8'));
                postData = articlesJson.find((p: any) => p.slug === slug);
              } catch(e) {}
            }
          }
          
          if (postData) {
            const siteName = 'TechNova';
            const title = postData.title.includes(siteName) ? postData.title : `${postData.title} | ${siteName}`;
            const description = postData.metaDescription || postData.excerpt || title;
            const image = postData.coverImage || 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop';

            const { generateBlogPostGraphSchema } = await import('./src/lib/seo.ts');
            const schema = generateBlogPostGraphSchema(postData);
            jsonLdScript = `\n<script type="application/ld+json" data-rh="true">\n${JSON.stringify(schema)}\n</script>\n`;

            if (template.includes('<title data-rh="true">')) {
              template = template.replace(/<title data-rh="true">.*?<\/title>/i, `<title data-rh="true">${title}</title>`);
            } else if (template.includes('<title>')) {
              template = template.replace(/<title>.*?<\/title>/i, `<title data-rh="true">${title}</title>`);
            } else {
              template = template.replace('</head>', `<title data-rh="true">${title}</title>\n</head>`);
            }
            
            if (template.includes('<meta name="description"')) {
              template = template.replace(/<meta\s+(?:data-rh="true"\s+)?name="description"\s+content="[^"]*"\s*(?:data-rh="true"\s*)?\/?>/i, `<meta name="description" content="${description}" data-rh="true" />`);
            } else {
              template = template.replace('</head>', `<meta name="description" content="${description}" data-rh="true" />\n</head>`);
            }

            const preloadImg = getOptimizedImageUrl(postData.coverImage, 800);
            const ogTags = `
              <link rel="preload" as="image" href="${preloadImg}" fetchpriority="high" />
              <meta property="og:title" content="${title}" data-rh="true" />
              <meta property="og:description" content="${description}" data-rh="true" />
              <meta property="og:image" content="${image}" data-rh="true" />
              <meta property="og:type" content="article" data-rh="true" />
              <meta property="og:site_name" content="TechNova" data-rh="true" />
              <meta name="application-name" content="TechNova" data-rh="true" />
              <meta name="twitter:card" content="summary_large_image" data-rh="true" />
              <meta name="twitter:title" content="${title}" data-rh="true" />
              <meta name="twitter:description" content="${description}" data-rh="true" />
              <meta name="twitter:image" content="${image}" data-rh="true" />${jsonLdScript}
            `;
            template = template.replace('</head>', `${ogTags}\n</head>`);
          }
        } else if (url.startsWith('/case-studies/')) {
          const caseStudyMatch = url.match(/^\/case-studies\/([^/?#&]+)/);
          if (caseStudyMatch) {
            const slug = caseStudyMatch[1];
            const { caseStudies } = await import('./src/data/caseStudiesData.tsx');
            const study = caseStudies.find((s: any) => s.slug === slug);
            
            if (study) {
              const { BASE_URL } = await import('./src/lib/seo.ts');
              const title = `Case Study: ${study.company} | TechNova`;
              const description = (study.context.replace(/<[^>]+>/g, '').substring(0, 160) + '...').trim();
              
              const caseStudySchema = {
                '@context': 'https://schema.org',
                '@type': 'Article',
                '@id': `${BASE_URL}/case-studies/${study.slug}#article`,
                headline: `Case Study: ${study.company} - ${study.industry}`,
                description: description,
                articleSection: study.industry,
                author: {
                  '@type': 'Organization',
                  name: 'TechNova',
                  '@id': `${BASE_URL}/#organization`,
                },
                publisher: {
                  '@type': 'Organization',
                  name: 'TechNova',
                  '@id': `${BASE_URL}/#organization`,
                },
                about: {
                  '@type': 'Organization',
                  name: study.company,
                },
                mainEntityOfPage: {
                  '@type': 'WebPage',
                  '@id': `${BASE_URL}/case-studies/${study.slug}`
                }
              };

              jsonLdScript = `\n<script type="application/ld+json" data-rh="true">\n${JSON.stringify([generateOrganizationSchema(), generateWebSiteSchema(), caseStudySchema])}\n</script>\n`;

              if (template.includes('<title data-rh="true">')) {
                template = template.replace(/<title data-rh="true">.*?<\/title>/i, `<title data-rh="true">${title}</title>`);
              } else if (template.includes('<title>')) {
                template = template.replace(/<title>.*?<\/title>/i, `<title data-rh="true">${title}</title>`);
              } else {
                template = template.replace('</head>', `<title data-rh="true">${title}</title>\n</head>`);
              }
              
              if (template.includes('<meta name="description"')) {
                template = template.replace(/<meta\s+(?:data-rh="true"\s+)?name="description"\s+content="[^"]*"\s*(?:data-rh="true"\s*)?\/?>/i, `<meta name="description" content="${description}" data-rh="true" />`);
              } else {
                template = template.replace('</head>', `<meta name="description" content="${description}" data-rh="true" />\n</head>`);
              }

              const ogTags = `
                <meta property="og:title" content="${title}" data-rh="true" />
                <meta property="og:description" content="${description}" data-rh="true" />
                <meta property="og:type" content="article" data-rh="true" />
                <meta property="og:site_name" content="TechNova" data-rh="true" />
                <meta name="twitter:card" content="summary" data-rh="true" />
                <meta name="twitter:title" content="${title}" data-rh="true" />
                <meta name="twitter:description" content="${description}" data-rh="true" />${jsonLdScript}
              `;
              template = template.replace('</head>', `${ogTags}\n</head>`);
            } else {
              template = template.replace('</head>', `${jsonLdScript}\n</head>`);
            }
          } else {
            template = template.replace('</head>', `${jsonLdScript}\n</head>`);
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
            postsList = [...POSTS];
            try {
              const articlesJson = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'public/data/articles.json'), 'utf8'));
              postsList = [...postsList, ...articlesJson];
            } catch(e) {}
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
          jsonLdScript = `\n<script type="application/ld+json" data-rh="true">\n${JSON.stringify(genericSchemas)}\n</script>\n`;
          template = template.replace('</head>', `${jsonLdScript}\n</head>`);
        } else {
          // All other pages (Home, About, Contact)
          jsonLdScript = `\n<script type="application/ld+json" data-rh="true">\n${JSON.stringify(genericSchemas)}\n</script>\n`;
          if (cleanPath === '/') {
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
              postsList = [...POSTS];
              try {
                const articlesJson = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'public/data/articles.json'), 'utf8'));
                postsList = [...postsList, ...articlesJson];
              } catch(e) {}
            }
            const posts = postsList.filter((p: any) => p.status === 'published' || !p.status);
            const featuredPosts = posts.filter((post: any) => post.featured);
            const carouselPosts = featuredPosts.length > 0 ? featuredPosts : posts.slice(0, 3);
            const firstPost = carouselPosts[0];
            const firstImg = firstPost ? firstPost.coverImage : '';
            const preloadImg = getOptimizedImageUrl(firstImg, 800);
            template = template.replace('</head>', `<link rel="preload" as="image" href="${preloadImg}" fetchpriority="high" />\n${jsonLdScript}\n</head>`);
          } else {
            template = template.replace('</head>', `${jsonLdScript}\n</head>`);
          }
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
