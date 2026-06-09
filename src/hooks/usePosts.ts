import { useState, useEffect } from 'react';
import { Post } from '../types';
import { getPostsPaginated, PaginatedResponse } from '../lib/postService';

export function usePosts(
  page: number = 1,
  pageSize: number = 10,
  category: string | null = null,
  postIds: string[] | null = null
) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);
        const response = await getPostsPaginated(page, pageSize, category, postIds);
        setPosts(response.posts);
        setTotalPosts(response.totalPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    }

    // Only skip fetching if postIds is explicitly an empty array (meaning search returned 0 results)
    if (postIds && postIds.length === 0) {
      setPosts([]);
      setTotalPosts(0);
      setLoading(false);
      return;
    }

    fetchPosts();
  }, [page, pageSize, category, postIds]);

  return { posts, totalPosts, loading };
}
