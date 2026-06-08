export const BASE_URL = (typeof process !== 'undefined' && process.env ? process.env.VITE_SITE_URL : (import.meta as any).env?.VITE_SITE_URL) || 'https://tech-nova-iota.vercel.app';

export function generateBreadcrumbSchema(items: { name: string; item: string }[], id?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    ...(id ? { '@id': id } : {}),
    itemListElement: items.map((breadcrumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: breadcrumb.name,
      item: breadcrumb.item.startsWith('http') ? breadcrumb.item : `${BASE_URL}${breadcrumb.item}`,
    })),
  };
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}

export function generateOrganizationSchema() {
  return {
    '@type': 'Organization',
    '@id': `${BASE_URL}/#organization`,
    name: 'TechNova',
    alternateName: 'TechNova Blog',
    description: 'Expert insights into Artificial Intelligence, software architecture, and enterprise technology.',
    url: BASE_URL,
    logo: {
      '@type': 'ImageObject',
      '@id': `${BASE_URL}/#logo`,
      url: `${BASE_URL}/tech-nova-enterprise-software-ai-blog-logo.svg`,
      width: 600,
      height: 60,
      caption: 'TechNova Blog Logo'
    },
    foundingDate: '2023-01-01',
    founders: [
        {
            '@type': 'Person',
            name: 'TechNova Team'
        }
    ],
    knowsAbout: ['Artificial Intelligence', 'Software Architecture', 'Web Development', 'Cybersecurity', 'Machine Learning'],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'hello@tech-nova-iota.vercel.app',
      url: `${BASE_URL}/contact`
    },
    image: {
      '@id': `${BASE_URL}/#logo`
    },
    sameAs: [
      'https://twitter.com/technova',
      'https://linkedin.com/company/technova',
      'https://github.com/technova'
    ]
  };
}

export function generateWebSiteSchema(keywords?: string[]) {
  return {
    '@type': 'WebSite',
    '@id': `${BASE_URL}/#website`,
    url: BASE_URL,
    name: 'TechNova',
    alternateName: ['TechNova Blog', 'Tech Nova', 'Technova'],
    description: 'Expert insights into AI, software architecture, and enterprise technology.',
    publisher: {
      '@id': `${BASE_URL}/#organization`
    },
    potentialAction: [
      {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${BASE_URL}/blog?search={search_term_string}`
        },
        'query-input': 'required name=search_term_string'
      }
    ],
    inLanguage: 'en-US',
    keywords: keywords ? keywords.join(', ') : undefined
  };
}

export function generateWebPageSchema(options: { url: string; name: string; description: string; breadcrumbId?: string; type?: string }) {
  const schema: any = {
    '@type': options.type || 'WebPage',
    '@id': `${options.url}/#webpage`,
    url: options.url,
    name: options.name,
    description: options.description,
    inLanguage: 'en-US',
    isPartOf: {
      '@id': `${BASE_URL}/#website`
    }
  };
  if (options.breadcrumbId) {
    schema.breadcrumb = { '@id': options.breadcrumbId };
  }
  return schema;
}

export function generateAboutPageSchema() {

  return {
    '@type': 'AboutPage',
    '@id': `${BASE_URL}/about/#webpage`,
    url: `${BASE_URL}/about`,
    name: 'About TechNova Blog',
    description: 'Learn about our mission, values, and the expert team behind TechNova Blog.',
    isPartOf: {
      '@id': `${BASE_URL}/#website`
    },
    breadcrumb: {
      '@id': `${BASE_URL}/about/#breadcrumb`
    }
  };
}

export function generateContactPageSchema() {
  return {
    '@type': 'ContactPage',
    '@id': `${BASE_URL}/contact/#webpage`,
    url: `${BASE_URL}/contact`,
    name: 'Contact TechNova Blog',
    description: 'Get in touch with the TechNova team for support, feedback, or collaboration.',
    isPartOf: {
      '@id': `${BASE_URL}/#website`
    },
    breadcrumb: {
      '@id': `${BASE_URL}/contact/#breadcrumb`
    }
  };
}

export function generateCollectionPageSchema(name: string, description: string, url: string) {
  return {
    '@type': 'CollectionPage',
    '@id': `${url}/#webpage`,
    url: url,
    name: name,
    description: description,
    isPartOf: {
      '@id': `${BASE_URL}/#website`
    }
  };
}

export function generateBlogIndexGraphSchema(posts: any[], page: number, category?: string | null) {
  const url = `${BASE_URL}/blog${category ? `?category=${category}` : ''}${page > 1 ? (category ? '&' : '?') + `page=${page}` : ''}`;
  const name = category ? `${category} Articles | TechNova Blog` : 'Our Blog | TechNova';
  const description = 'Deep dives, tutorials, and insights into the ever-evolving world of technology.';

  const graph: any[] = [];

  graph.push(generateOrganizationSchema());
  graph.push(generateWebSiteSchema());

  graph.push({
    '@type': 'CollectionPage',
    '@id': `${url}/#webpage`,
    url: url,
    name: name,
    description: description,
    isPartOf: {
      '@id': `${BASE_URL}/#website`
    },
    breadcrumb: {
      '@id': `${url}/#breadcrumb`
    }
  });

  graph.push(generateBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Blog', item: '/blog' },
    ...(category ? [{ name: category, item: `/blog?category=${category}` }] : [])
  ], `${url}/#breadcrumb`));

  graph.push({
    '@type': 'ItemList',
    '@id': `${url}/#itemlist`,
    mainEntityOfPage: {
      '@id': `${url}/#webpage`
    },
    itemListElement: posts.map((post, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'BlogPosting',
        url: `${BASE_URL}/blog/${post.slug}`,
        name: post.title,
        description: post.metaDescription || post.excerpt,
        datePublished: post.date,
        image: post.coverImage,
        author: {
          '@type': 'Person',
          name: 'TechNova Team'
        }
      }
    }))
  });

  return {
    '@context': 'https://schema.org',
    '@graph': graph
  };
}

export function generateArticleSchema(post: any) {
  // Keeping this for backward compatibility if needed, but generateBlogPostGraphSchema is preferred
  const postUrl = `${BASE_URL}/blog/${post.slug}`;
  return {
    '@type': 'BlogPosting',
    '@id': `${postUrl}/#article`,
    headline: post.title,
    description: post.metaDescription || post.excerpt,
    author: {
      '@type': (post.author?.name || '').includes('Team') ? 'Organization' : 'Person',
      name: post.author?.name || 'TechNova Team',
      jobTitle: post.author?.role || undefined
    },
    articleSection: post.category,
    datePublished: post.date,
    dateModified: post.date,
    image: post.coverImage,
    publisher: {
      '@id': `${BASE_URL}/#organization`
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl
    }
  };
}

export function generateBlogPostGraphSchema(post: any) {
  const postUrl = `${BASE_URL}/blog/${post.slug}`;
  const authorName = post.author?.name || 'TechNova Team';
  
  const graph: any[] = [];

  // Determine article type based on tags or title
  const tagsStr = (post.tags || []).join(' ').toLowerCase();
  const titleStr = post.title.toLowerCase();
  
  let articleType = 'Article';
  if (tagsStr.includes('tech') || tagsStr.includes('software') || tagsStr.includes('developer') || tagsStr.includes('ai') || titleStr.includes('ai')) {
    articleType = 'TechArticle';
  } else if (tagsStr.includes('tutorial') || titleStr.includes('how to')) {
    articleType = 'HowTo';
  } else if (tagsStr.includes('news')) {
    articleType = 'NewsArticle';
  }

  // 1. Organization
  graph.push(generateOrganizationSchema());

  // 2. WebSite
  graph.push(generateWebSiteSchema(post.tags));

  // 3. WebPage (container for the article)
  graph.push({
    '@type': 'WebPage',
    '@id': `${postUrl}/#webpage`,
    url: postUrl,
    name: post.title,
    isPartOf: {
      '@id': `${BASE_URL}/#website`
    },
    primaryImageOfPage: post.coverImage ? {
      '@id': `${postUrl}#primaryimage`
    } : undefined,
    breadcrumb: {
      '@id': `${postUrl}#breadcrumb`
    },
    description: post.metaDescription || post.excerpt,
    inLanguage: 'en-US',
    potentialAction: [
      {
        '@type': 'ReadAction',
        target: [postUrl]
      }
    ]
  });

  // 4. Primary Image
  if (post.coverImage) {
    graph.push({
      '@type': 'ImageObject',
      '@id': `${postUrl}#primaryimage`,
      url: post.coverImage,
      contentUrl: post.coverImage,
      width: 1200,
      height: 675,
      caption: post.title
    });
  }

  // 5. Article / BlogPosting / TechArticle Schema
  graph.push({
    '@type': ['BlogPosting', articleType],
    '@id': `${postUrl}#article`,
    isPartOf: {
      '@id': `${postUrl}/#webpage`
    },
    author: {
      '@type': authorName.includes('Team') ? 'Organization' : 'Person',
      '@id': `${BASE_URL}/author/${authorName.toLowerCase().replace(/\s+/g, '-')}#author`,
      name: authorName,
      url: BASE_URL,
      jobTitle: post.author?.role || 'Tech Researcher',
      image: post.author?.avatar || undefined
    },
    headline: post.title,
    datePublished: post.date,
    dateModified: post.date,
    mainEntityOfPage: {
      '@id': `${postUrl}/#webpage`
    },
    wordCount: post.content ? post.content.split(/\s+/).length : undefined,
    publisher: {
      '@id': `${BASE_URL}/#organization`
    },
    image: post.coverImage ? {
      '@id': `${postUrl}#primaryimage`
    } : undefined,
    keywords: post.tags ? post.tags.join(', ') : undefined,
    articleSection: post.category,
    description: post.metaDescription || post.excerpt,
    articleBody: post.content ? post.content.substring(0, 500) + '...' : undefined
  });

  // 6. BreadcrumbList Schema
  graph.push(generateBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Blog', item: '/blog' },
    { name: post.title, item: `/blog/${post.slug}` }
  ], `${postUrl}#breadcrumb`));

  // 7. FAQPage Schema (Auto-extract from content if not explicitly in post.faqs)
  let faqs = post.faqs || [];
  if (faqs.length === 0 && post.content) {
     // rudimentary extraction of FAQ JSON-LD from the content HTML/markdown if embedded
     try {
       const jsonLdMatch = post.content.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);
       if (jsonLdMatch) {
         jsonLdMatch.forEach((script: string) => {
           const jsonStr = script.replace(/<script type="application\/ld\+json">|<\/script>/g, '');
           const parsed = JSON.parse(jsonStr);
           if (parsed['@type'] === 'FAQPage' && parsed.mainEntity) {
              faqs = [...faqs, ...parsed.mainEntity.map((q: any) => ({
                 question: q.name,
                 answer: q.acceptedAnswer?.text
              }))];
           }
         });
       }
     } catch (e) {
       // Ignore parsing errors
     }
  }

  if (faqs && faqs.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${postUrl}#faq`,
      mainEntity: faqs.map((faq: { question: string; answer: string }) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    });
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph
  };
}
