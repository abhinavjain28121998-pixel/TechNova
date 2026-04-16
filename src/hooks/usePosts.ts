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
        const fbPosts = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        })) as Post[];
        
        // If Firestore is empty, we don't return anything (admin should sync first)
        // Or we could merge, but for a clean migration, we just use Firestore.
        setPosts(fbPosts);
      } catch (error) {
        // We handle but don't block, so UI can show empty state or fallback
        console.warn("Firestore fetch error, possibly empty collection:", error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  return { posts, loading };
}
