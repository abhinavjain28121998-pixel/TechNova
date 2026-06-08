import { collection, getDocs, query, orderBy, limit, startAfter, getDoc, doc, where, documentId, getCountFromServer } from 'firebase/firestore';
import { db } from './firebase';
import { handleFirestoreError, OperationType } from './firestoreUtils';
import { Post } from '../types';

export interface PaginatedResponse {
  posts: Post[];
  totalPosts: number;
}

export const getPostsPaginated = async (
  page: number,
  pageSize: number,
  category: string | null = null,
  postIds: string[] | null = null
): Promise<PaginatedResponse> => {
  try {
    const allPosts = await getPosts();
    let filtered = allPosts;

    if (category) {
      filtered = filtered.filter(p => p.category === category);
    }

    if (postIds) {
      if (postIds.length === 0) return { posts: [], totalPosts: 0 };
      // Filter the posts that are present in the postIds array
      filtered = filtered.filter(p => postIds.includes(p.id));
      // Try to preserve search ranking order, but fallback implicitly
      try {
        filtered.sort((a, b) => postIds.indexOf(a.id) - postIds.indexOf(b.id));
      } catch (e) {
        console.warn('Sorting by semantic rank failed', e);
      }
    }

    const totalPosts = filtered.length;
    const posts = filtered.slice((page - 1) * pageSize, page * pageSize);

    return { posts, totalPosts };
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'posts');
    return { posts: [], totalPosts: 0 };
  }
};

export const getPosts = async (): Promise<Post[]> => {
  try {
    const q = query(collection(db, 'posts'), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    const posts: Post[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      // Ensure coverImage exists and has a fallback
      if (!data.coverImage || data.coverImage === 'undefined') {
        data.coverImage = '/banners/expert-outlook-navigating-artificial-intelligence-in-2026.png';
      }
      posts.push({ id: docSnap.id, ...data } as Post);
    });
    // Filter out drafts on the client since firestore composite index is missing
    return posts.filter(p => !p.status || p.status === 'published');
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'posts');
    return [];
  }
};

export const getPost = async (idOrSlug: string): Promise<Post | null> => {
  try {
    const docRef = doc(db, 'posts', idOrSlug);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Post;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `posts/${idOrSlug}`);
    return null;
  }
};
