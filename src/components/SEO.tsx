import { Helmet } from 'react-helmet-async';
import { generateOrganizationSchema, generateWebSiteSchema } from '../lib/seo';

interface SEOProps {
  title: string;
  description: string;
  type?: 'website' | 'article';
  url?: string;
  image?: string;
  schema?: Record<string, any> | any[];
  author?: string;
  publishedTime?: string;
  keywords?: string[];
  noindex?: boolean;
}

export function SEO({ 
  title, 
  description, 
  type = 'website', 
  url, 
  image, 
  schema,
  author,
  publishedTime,
  keywords,
  noindex = false
}: SEOProps) {
  const siteName = 'TechNova';
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
  const fullDescription = description.includes(siteName) ? description : `${description} | ${siteName}`;
  const currentUrl = typeof window !== 'undefined' 
    ? window.location.origin + window.location.pathname
    : (typeof process !== 'undefined' ? process.env.VITE_SITE_URL : 'https://tech-nova-iota.vercel.app') || 'https://tech-nova-iota.vercel.app';
  let rawUrl = url || currentUrl;
  if (rawUrl && rawUrl.length > 1 && rawUrl.endsWith('/')) {
    rawUrl = rawUrl.slice(0, -1);
  }
  const canonicalUrl = rawUrl;
  // Fallback image using images.unsplash.com as source.unsplash is deprecated
  const defaultImage = 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop';
  const socialImage = image || defaultImage;

  // Combine provided schemas with base site schemas
  let finalSchema: any[] = [];
  const baseSchemas = [generateWebSiteSchema(keywords), generateOrganizationSchema()];
  
  if (schema) {
    if (Array.isArray(schema)) {
      finalSchema = [...schema];
    } else {
      finalSchema = [schema];
    }
  }

  // Add base schemas if they aren't already included (simple deduplication by @type)
  // Skip this if the user is passing a @graph schema directly
  if (!schema || !('@graph' in schema)) {
    baseSchemas.forEach(baseSchema => {
      if (!finalSchema.some(s => s['@type'] === baseSchema['@type'])) {
        finalSchema.push(baseSchema);
      }
    });
  }

  const jsonLdContent = schema && '@graph' in schema ? schema : finalSchema;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      {keywords && keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={socialImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={siteName} />
      
      {/* Optional OG properties for Articles */}
      {author && <meta property="article:author" content={author} />}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={socialImage} />
      {author && <meta name="twitter:creator" content={author} />}

      {/* Schema.org JSON-LD */}
      {jsonLdContent && (Array.isArray(jsonLdContent) ? jsonLdContent.length > 0 : true) && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdContent) }} />
      )}
    </Helmet>
  );
}
