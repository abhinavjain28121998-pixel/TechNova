import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Post } from '../types';
import { OperationType, handleFirestoreError } from '../lib/firestoreUtils';

/**
 * Fetches a specific post by its slug from Firestore and falls back to static posts if not found.
 * @param slug The post slug or ID
 * @returns Promise<Post | null>
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const path = `posts/${slug}`;
  try {
    try {
      const docRef = doc(db, 'posts', slug);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return { 
          id: docSnap.id, 
          ...data,
          // Ensure dates are strings for consistency with static data types
          date: data.date?.toDate?.() ? data.date.toDate().toISOString() : data.date 
        } as Post;
      }
    } catch (fsError) {
      // Re-throw using the project's standard error handler for Firestore
      handleFirestoreError(fsError, OperationType.GET, path);
    }
  } catch (error) {
    console.warn(`Firestore lookup failed for slug: ${slug}, attempting static fallback.`, error);
  }

  // Fallback to static posts
  try {
    const { POSTS: staticPosts } = await import('../data/posts');
    const staticMatch = staticPosts.find(p => p.slug === slug || p.id === slug);
    return staticMatch || null;
  } catch (err) {
    console.error('Failed to import static posts during fallback:', err);
    return null;
  }
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
          // Attempt to parse the JSON error from handleFirestoreError if it exists
          let message = 'An error occurred while loading the post';
          try {
            const parsed = JSON.parse(err.message);
            if (parsed.error) message = parsed.error;
          } catch {
            message = err.message || message;
          }
          setError(message);
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
