export interface Author {
  name: string;
  avatar: string;
  role: string;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  date: string;
  readingTime: string;
  category: string;
  author: Author;
  featured?: boolean;
  trending?: boolean;
  status?: 'draft' | 'published';
}

export const CATEGORIES = [
  'AI',
  'Tech News',
  'Web Development',
  'Gadgets',
  'Cybersecurity',
  'Software',
];

const authors = {
  alex: {
    name: 'Alex Rivera',
    avatar: 'https://picsum.photos/seed/alex/100/100',
    role: 'Senior Tech Editor',
  },
  sarah: {
    name: 'Sarah Chen',
    avatar: 'https://picsum.photos/seed/sarah/100/100',
    role: 'AI Researcher',
  },
  marcus: {
    name: 'Marcus Johnson',
    avatar: 'https://picsum.photos/seed/marcus/100/100',
    role: 'Security Analyst',
  },
};

export const POSTS: Post[] = [
  {
    id: 'clean-post-1',
    slug: 'understanding-artificial-intelligence-2026',
    title: 'Understanding Artificial Intelligence in 2026',
    excerpt: 'A comprehensive, entirely error-free guide to the state of AI models, ethical implications, and practical implementations today.',
    content: `
## The Evolution of AI

Artificial Intelligence has rapidly evolved. Today, we stand at the precipice of a new era where models are increasingly capable of reasoning, planning, and executing complex tasks without human intervention.

### Key Pillars of Modern AI

1. **Generative Models**: Moving beyond simple text to multi-modal generation including high-res video and immersive audio.
2. **Agentic Workflows**: AI systems that can execute multi-step logic and debug themselves in real-time.
3. **Edge AI**: Running complex models directly on local devices for faster, secure, offline processing.

This is a clean, properly formatted markdown post designed to render flawlessly across all platforms and SEO scrapers.
    `,
    coverImage: 'https://picsum.photos/seed/ai-clean/1200/600',
    date: '2026-04-19T10:00:00Z',
    readingTime: '4 min read',
    category: 'AI',
    author: authors.sarah,
    featured: true,
    trending: true,
    status: 'published'
  },
  {
    id: 'clean-post-2',
    slug: 'secure-web-development-practices',
    title: 'Modern Web Development: Security First',
    excerpt: 'Explore perfectly sound and secure web development practices to build resilient, serverless applications.',
    content: `
## Security First Approach

In the modern web, security cannot be an afterthought. With the rise of automated vulnerability scanning, every single endpoint and database rule must be hardened from day one.

### Essential Implementation Details

*   **Always use HTTPS/TLS** to secure data in transit.
*   **Implement strict Content Security Policies (CSP)** to prevent rogue script injections.
*   **Sanitize all user inputs** strictly to prevent XSS (Cross-Site Scripting) and database manipulation.

Building a secure web app requires vigilance, automated CI/CD pipelines, and strict adherence to access configurations (like Zero Trust).
    `,
    coverImage: 'https://picsum.photos/seed/webdev1/1200/600',
    date: '2026-04-18T14:30:00Z',
    readingTime: '5 min read',
    category: 'Web Development',
    author: authors.alex,
    featured: false,
    trending: true,
    status: 'published'
  },
  {
    id: 'clean-post-3',
    slug: 'demystifying-zero-trust',
    title: 'Demystifying Zero Trust Architectures',
    excerpt: 'A flawless breakdown of what Zero Trust actually means in modern enterprise environments.',
    content: `
## No More Perimeters

For decades, network security relied on the "castle and moat" concept. Today, that model is fundamentally broken due to remote work and BYOD (Bring Your Own Device).

### Core Principles of Zero Trust

1. **Verify Explicitly**: Always authenticate and authorize based on all available data points (Identity, location, device health).
2. **Least Privilege System**: Only provide access to what is absolutely necessary for the absolute minimum amount of time.
3. **Assume Breach**: Constantly monitor systems and segment network access to minimize the "blast radius" if an attacker gains entry.

Implementing Zero Trust yields significantly fewer security incidents and drastically faster recovery times.
    `,
    coverImage: 'https://picsum.photos/seed/cyber1/1200/600',
    date: '2026-04-15T09:15:00Z',
    readingTime: '6 min read',
    category: 'Cybersecurity',
    author: authors.marcus,
    featured: true,
    trending: false,
    status: 'published'
  }
];
