export const BASE_URL = typeof window !== 'undefined' 
  ? window.location.origin 
  : (process.env.VITE_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://tech-nova-iota.vercel.app'));

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
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'TechNova Blog',
    url: BASE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${BASE_URL}/logo.svg`,
      width: 600,
      height: 60,
      caption: 'TechNova Blog Logo'
    }
  };
}

export function generateWebSiteSchema(keywords?: string[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'TechNova Blog',
    url: BASE_URL,
    description: 'Exploring the frontiers of technology, one article at a time. Stay updated with the latest in AI, Web Dev, and Cybersecurity.',
    ...(keywords && keywords.length > 0 ? { keywords: keywords.join(', ') } : {}),
    potentialAction: {
      '@type': 'SearchAction',
      target: `${BASE_URL}/blog?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateArticleSchema(post: any) {
  const imageUrl = post.coverImage 
    ? (post.coverImage.startsWith('http') ? post.coverImage : `${BASE_URL}${post.coverImage}`)
    : `${BASE_URL}/default-cover.jpg`; // Fallback image
    
  const wordCount = post.content ? post.content.split(/\s+/).length : 0;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article', // Using specific Article instead of BlogPosting for broader SEO
    headline: post.title,
    image: {
      '@type': 'ImageObject',
      url: imageUrl,
      width: 1200,
      height: 630
    },
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Person',
      name: post.author?.name || 'TechNova Team',
      url: `${BASE_URL}/author/${(post.author?.name || 'TechNova Team').toLowerCase().replace(/\s+/g, '-')}`,
      image: post.author?.avatar ? (post.author.avatar.startsWith('http') ? post.author.avatar : `${BASE_URL}${post.author.avatar}`) : undefined
    },
    publisher: {
      '@type': 'Organization',
      name: 'TechNova Blog',
      url: BASE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/logo.svg`,
        width: 600,
        height: 60,
        caption: 'TechNova Blog Logo'
      },
    },
    description: post.excerpt || post.title,
    articleBody: post.content ? post.content.substring(0, 1500) + '...' : '',
    wordCount: wordCount,
    inLanguage: "en-US",
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/blog/${post.slug}`,
    },
  };
}

export function generateBlogPostGraphSchema(post: any) {
  const imageUrl = post.coverImage 
    ? (post.coverImage.startsWith('http') ? post.coverImage : `${BASE_URL}${post.coverImage}`)
    : `${BASE_URL}/default-cover.jpg`;

  const wordCount = post.content ? post.content.split(/\s+/).length : 0;
  const postUrl = `${BASE_URL}/blog/${post.slug}`;
  const authorName = post.author?.name || 'TechNova Team';
  const authorUrl = `${BASE_URL}/author/${authorName.toLowerCase().replace(/\s+/g, '-')}`;

  const graph: any[] = [];

  // 1. Organization Schema
  graph.push({
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
    }
  });

  // 2. WebSite Schema
  graph.push({
    '@type': 'WebSite',
    '@id': `${BASE_URL}/#website`,
    url: BASE_URL,
    name: 'TechNova Blog',
    description: 'Exploring the frontiers of technology, one article at a time.',
    publisher: { '@id': `${BASE_URL}/#organization` }
  });

  // 3. BlogPosting Schema
  const blogPosting: any = {
    '@type': 'BlogPosting',
    '@id': `${postUrl}#article`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl
    },
    headline: post.title ? post.title.substring(0, 110) : '',
    description: post.metaDescription || post.excerpt || post.title,
    image: {
      '@type': 'ImageObject',
      '@id': `${postUrl}#image`,
      url: imageUrl,
      width: 1200,
      height: 630
    },
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Person',
      '@id': `${authorUrl}#person`,
      name: authorName,
      url: authorUrl
    },
    publisher: { '@id': `${BASE_URL}/#organization` },
    inLanguage: "en-US",
    isPartOf: { '@id': `${BASE_URL}/#website` },
    articleSection: post.category || 'Technology',
    wordCount: wordCount
  };

  if (post.tags && post.tags.length > 0) {
    blogPosting.keywords = post.tags.join(', ');
  }

  // Adding about and mentions conceptually based on tags or category for EEAT
  blogPosting.about = [
    {
      "@type": "Thing",
      "name": post.category || 'Technology'
    }
  ];
  
  if (post.tags && post.tags.length > 0) {
    blogPosting.mentions = post.tags.map((tag: string) => ({
      "@type": "Thing",
      "name": tag
    }));
  }

  graph.push(blogPosting);

  // 4. BreadcrumbList Schema
  graph.push({
    '@type': 'BreadcrumbList',
    '@id': `${postUrl}#breadcrumb`,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: BASE_URL
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: post.category || 'Blog',
        item: `${BASE_URL}/blog?category=${encodeURIComponent(post.category || '')}`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: postUrl
      }
    ]
  });

  // 5. FAQPage Schema
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

export function generateAboutPageSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About TechNova',
    description: 'Learn more about TechNova and our mission to decode the future of technology.',
    url: `${BASE_URL}/about`,
    publisher: {
      '@type': 'Organization',
      name: 'TechNova Blog',
    }
  };
}

export function generateContactPageSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact TechNova',
    description: 'Get in touch with the TechNova team for inquiries, feedback, or collaborations.',
    url: `${BASE_URL}/contact`,
    mainEntity: {
      '@type': 'Organization',
      name: 'TechNova Blog',
      url: BASE_URL,
    }
  };
}
