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
    const postsRef = collection(db, 'posts');
    let qConstraints: any[] = [];

    if (category) {
      qConstraints.push(where('category', '==', category));
    }
    
    // Only published posts if we added a status field, though we can assume all db posts are published for now.

    if (postIds) {
      if (postIds.length === 0) {
        return { posts: [], totalPosts: 0 };
      }
      
      const paginatedIds = postIds.slice((page - 1) * pageSize, page * pageSize);
      if (paginatedIds.length === 0) return { posts: [], totalPosts: postIds.length };
      
      // Firestore 'in' query has a max of 30, we have max pageSize = 10, so it's safe.
      const snapshot = await getDocs(query(postsRef, where(documentId(), 'in', paginatedIds)));
      
      const posts: Post[] = [];
      snapshot.forEach(docSnap => posts.push({ id: docSnap.id, ...docSnap.data() } as Post));
      
      // Preserve original semantic search order
      posts.sort((a, b) => paginatedIds.indexOf(a.id) - paginatedIds.indexOf(b.id));
      
      return { posts, totalPosts: postIds.length };
    }

    // Normal path: Get total count for pagination
    let countQuery = query(postsRef, ...qConstraints);
    const countSnapshot = await getCountFromServer(countQuery);
    const totalPosts = countSnapshot.data().count;

    // We can't rely on simple offset in firestore, we have to use startAfter.
    // For simple offset, we'd need to fetch up to the offset.
    // Since Firebase JS SDK doesn't natively expose offset() easily yet, we can fetch all up to the limit * page 
    // and just slice the array, or do N queries. Given we want numbered pages, we can just over-fetch IDs or overfetch docs.
    // Given the max size is ~1000 posts, fetching 50 docs is very fast. 
    qConstraints.push(orderBy('date', 'desc'));
    qConstraints.push(limit(page * pageSize));

    const q = query(postsRef, ...qConstraints);
    const querySnapshot = await getDocs(q);
    
    const allFetched: Post[] = [];
    querySnapshot.forEach(docSnap => allFetched.push({ id: docSnap.id, ...docSnap.data() } as Post));
    
    const posts = allFetched.slice((page - 1) * pageSize, page * pageSize);

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
      posts.push({ id: docSnap.id, ...docSnap.data() } as Post);
    });
    return posts;
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
