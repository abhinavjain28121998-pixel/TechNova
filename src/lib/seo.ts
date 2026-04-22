export const BASE_URL = 'https://tech-nova-iota.vercel.app';

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
      url: `${BASE_URL}/logo.png`,
      width: 600,
      height: 60
    },
    sameAs: [
      'https://twitter.com/technova',
      'https://github.com/technova',
    ],
  };
}

export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'TechNova Blog',
    url: BASE_URL,
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
        url: `${BASE_URL}/logo.png`, // Placeholder, assuming there's a logo or it will be added
        width: 600,
        height: 60
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
