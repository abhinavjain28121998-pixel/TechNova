import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Post } from '../data/posts';
import { OperationType, handleFirestoreError } from '../lib/firestoreUtils';

export function usePost(slug: string | undefined) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    async function fetchPost() {
      const path = `posts/${slug}`;
      try {
        const docRef = doc(db, 'posts', slug);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setPost({ id: docSnap.id, ...docSnap.data() } as Post);
        } else {
          // Check static data
          import('../data/posts').then(({ POSTS: staticPosts }) => {
            const staticMatch = staticPosts.find(p => p.slug === slug || p.id === slug);
            setPost(staticMatch || null);
          });
        }
      } catch (error) {
        // Fallback to static on error
        import('../data/posts').then(({ POSTS: staticPosts }) => {
          const staticMatch = staticPosts.find(p => p.slug === slug || p.id === slug);
          setPost(staticMatch || null);
        });
        console.warn('Fallback to static source for single post.', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [slug]);

  return { post, loading };
}
