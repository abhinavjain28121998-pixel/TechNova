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
    logo: `${BASE_URL}/logo.png`, // Placeholder, assuming there's a logo or it will be added
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
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    image: post.coverImage.startsWith('http') ? post.coverImage : `${BASE_URL}${post.coverImage}`,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Person',
      name: post.author.name,
    },
    publisher: {
      '@type': 'Organization',
      name: 'TechNova Blog',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/logo.png`,
      },
    },
    description: post.excerpt,
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
