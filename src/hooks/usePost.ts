import { useState, useEffect } from 'react';
import { Post } from '../types';
import { getPost } from '../lib/postService';

/**
 * Fetches a specific post by its slug
 * @param slug The post slug or ID
 * @returns Promise<Post | null>
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  return await getPost(slug);
}

export function usePost(slug: string | undefined) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!slug) {
      if (isMounted) {
        setPost(null);
        setLoading(false);
        setError(null);
      }
      return;
    }

    async function fetchPost() {
      if (isMounted) {
        setLoading(true);
        setError(null);
      }

      try {
        const result = await getPostBySlug(slug!);
        
        if (isMounted) {
          setPost(result);
          if (!result) {
            setError('Post not found');
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'An error occurred while loading the post');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchPost();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  return { post, loading, error };
}
