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
 metaDescription?: string;
 content: string;
 coverImage: string;
 date: string;
 readingTime: string;
 category: string;
 author: Author;
 featured?: boolean;
 trending?: boolean;
 status?: 'draft' | 'published';
 isExpertVerified?: boolean;
 tags?: string[];
 faqs?: { question: string; answer: string }[];
}

export const authors = {
 alex: {
 name: 'TechNova Team',
 avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TechNova+Team',
 role: 'TechNova Team',
 },
 sarah: {
 name: 'TechNova Team',
 avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TechNova+Team',
 role: 'TechNova Team',
 },
 marcus: {
 name: 'TechNova Team',
 avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TechNova+Team',
 role: 'TechNova Team',
 },
};
