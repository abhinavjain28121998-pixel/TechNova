import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { Post } from '../data/posts';
import { OperationType, handleFirestoreError } from '../lib/firestoreUtils';

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      const path = 'posts';
      try {
        const q = query(collection(db, path), orderBy('date', 'desc'));
        const snapshot = await getDocs(q);
        const fbPostsMap = new Map();
        
        snapshot.docs.forEach(doc => {
          fbPostsMap.set(doc.id, { id: doc.id, ...doc.data() });
        });

        // Combine static posts with Firestore posts. 
        // Firestore posts take precedence if they share the same 'id' or 'slug'
        import('../data/posts').then(({ POSTS: staticPosts }) => {
          const combined = [...staticPosts];
          const combinedMap = new Map();
          
          // First add static
          combined.forEach(p => {
             // We use slug or id as key
             combinedMap.set(p.slug || p.id, p);
          });
          
          // Then override/add with firebase
          fbPostsMap.forEach((p, key) => {
             combinedMap.set(p.slug || p.id || key, p);
          });
          
          const finalPosts = Array.from(combinedMap.values());
          // Sort by date desc
          finalPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          
          setPosts(finalPosts);
        });
      } catch (error) {
        // Fallback to static posts if fetch fails
        import('../data/posts').then(({ POSTS: staticPosts }) => {
          setPosts(staticPosts);
        });
        console.warn("Firestore fetch error, fallback to static collection:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  return { posts, loading };
}
