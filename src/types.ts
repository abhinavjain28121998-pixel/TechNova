export interface Author {
  name: string;
  avatar: string;
  role: string;
  bio?: string;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  metaDescription?: string;
  content: string;
  coverImage?: string;
  date: string;
  readingTime?: string;
  category: string;
  author: Author;
  featured?: boolean;
  trending?: boolean;
  status?: 'draft' | 'published';
  isExpertVerified?: boolean;
  tags?: string[];
  faqs?: { question: string; answer: string }[];
}
