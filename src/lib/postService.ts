import { Post } from '../types';

export interface PaginatedResponse {
  posts: Post[];
  totalPosts: number;
}

let cachedPosts: Post[] | null = null;

const fetchAllPosts = async (): Promise<Post[]> => {
  if (cachedPosts) return cachedPosts;
  try {
    const response = await fetch('/data/articles.json');
    if (!response.ok) {
      throw new Error('Failed to fetch articles');
    }
    const data: Post[] = await response.json();
    
    // Process and sort posts
    cachedPosts = data
      .filter(p => !p.status || p.status === 'published')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map(p => {
        if (!p.coverImage || p.coverImage === 'undefined') {
          p.coverImage = '/banners/expert-outlook-navigating-artificial-intelligence-in-2026.png';
        }
        return p;
      });
      
    return cachedPosts;
  } catch (error) {
    console.error('Error fetching articles.json:', error);
    return [];
  }
};

export const getPostsPaginated = async (
  page: number,
  pageSize: number,
  category: string | null = null,
  postIds: string[] | null = null
): Promise<PaginatedResponse> => {
  try {
    const allPosts = await fetchAllPosts();
    let filtered = allPosts;

    if (category) {
      filtered = filtered.filter(p => p.category === category);
    }

    if (postIds) {
      if (postIds.length === 0) return { posts: [], totalPosts: 0 };
      // Filter the posts that are present in the postIds array
      filtered = filtered.filter(p => postIds.includes(p.id || p.slug));
      // Try to preserve search ranking order
      try {
        filtered.sort((a, b) => {
          const aId = a.id || a.slug;
          const bId = b.id || b.slug;
          return postIds.indexOf(aId) - postIds.indexOf(bId);
        });
      } catch (e) {
        console.warn('Sorting by semantic rank failed', e);
      }
    }

    const totalPosts = filtered.length;
    const posts = filtered.slice((page - 1) * pageSize, page * pageSize);

    return { posts, totalPosts };
  } catch (error) {
    console.error('Error in getPostsPaginated:', error);
    return { posts: [], totalPosts: 0 };
  }
};

export const getPosts = async (): Promise<Post[]> => {
  return await fetchAllPosts();
};

export const getPost = async (idOrSlug: string): Promise<Post | null> => {
  try {
    const allPosts = await fetchAllPosts();
    const post = allPosts.find(p => p.id === idOrSlug || p.slug === idOrSlug);
    return post || null;
  } catch (error) {
    console.error(`Error fetching post ${idOrSlug}:`, error);
    return null;
  }
};
