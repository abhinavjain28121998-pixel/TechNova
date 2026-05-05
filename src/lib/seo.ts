export const BASE_URL = typeof window !== 'undefined' 
  ? window.location.origin 
  : (process.env.VITE_SITE_URL || 'https://tech-nova-iota.vercel.app');

export function generateBreadcrumbSchema(items: { name: string; item: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((breadcrumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: breadcrumb.name,
      item: breadcrumb.item.startsWith('http') ? breadcrumb.item : `${BASE_URL}${breadcrumb.item}`,
    })),
  };
}

export function generateOrganizationSchema() {
  return {
    '@type': 'Organization',
    '@id': `${BASE_URL}/#organization`,
    name: 'TechNova Blog',
    url: BASE_URL,
    logo: {
      '@type': 'ImageObject',
      '@id': `${BASE_URL}/#logo`,
      url: `${BASE_URL}/logo.svg`,
      width: 600,
      height: 60,
      caption: 'TechNova Blog Logo'
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
    name: 'TechNova Blog',
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

export function generateArticleSchema(post: any) {
  // Keeping this for backward compatibility if needed, but generateBlogPostGraphSchema is preferred
  const postUrl = `${BASE_URL}/blog/${post.slug}`;
  return {
    '@type': 'BlogPosting',
    '@id': `${postUrl}/#article`,
    headline: post.title,
    description: post.metaDescription || post.excerpt,
    author: {
      '@type': 'Person',
      name: post.author?.name || 'TechNova Team'
    },
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

  // 1. Organization
  graph.push(generateOrganizationSchema());

  // 2. WebSite
  graph.push(generateWebSiteSchema(post.tags));

  // 3. WebPage (container for the article)
  graph.push({
    '@type': 'WebPage',
    '@id': postUrl,
    url: postUrl,
    name: post.title,
    isPartOf: {
      '@id': `${BASE_URL}/#website`
    },
    primaryImageOfPage: {
      '@id': `${postUrl}#primaryimage`
    },
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

  // 5. Article / BlogPosting Schema
  graph.push({
    '@type': 'BlogPosting',
    '@id': `${postUrl}#article`,
    isPartOf: {
      '@id': postUrl
    },
    author: {
      '@type': 'Person',
      '@id': `${BASE_URL}/author/${authorName.toLowerCase().replace(/\s+/g, '-')}#person`,
      name: authorName,
      url: `${BASE_URL}/about`,
      jobTitle: post.author?.role || 'Tech Researcher',
      image: post.author?.avatar || undefined
    },
    headline: post.title,
    datePublished: post.date,
    dateModified: post.date,
    mainEntityOfPage: {
      '@id': postUrl
    },
    wordCount: post.content ? post.content.split(/\s+/).length : undefined,
    publisher: {
      '@id': `${BASE_URL}/#organization`
    },
    image: {
      '@id': `${postUrl}#primaryimage`
    },
    keywords: post.tags ? post.tags.join(', ') : undefined,
    articleSection: post.category,
    description: post.metaDescription || post.excerpt,
    about: [
      {
        '@type': 'Thing',
        name: post.category,
        '@id': `${BASE_URL}/categories?c=${encodeURIComponent(post.category)}`
      }
    ]
  });

  // 6. BreadcrumbList Schema
  graph.push(generateBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Blog', item: '/blog' },
    { name: post.title, item: `/blog/${post.slug}` }
  ]));

  // 7. FAQPage Schema
  if (post.faqs && post.faqs.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${postUrl}#faq`,
      mainEntity: post.faqs.map((faq: { question: string; answer: string }) => ({
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
