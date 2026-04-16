import { useState, useEffect } from 'react';
import { auth, db, googleProvider } from '../lib/firebase';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  setDoc
} from 'firebase/firestore';
import { OperationType, handleFirestoreError } from '../lib/firestoreUtils';
import { POSTS, Post as StaticPost } from '../data/posts';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Plus, LogOut, Edit2, Trash2, RefreshCcw, Save, X } from 'lucide-react';
import { SEO } from '../components/SEO';

const ADMIN_EMAIL = 'abhinavj@leewayhertz.com';

interface PostRecord extends StaticPost {
  id: string;
}

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<PostRecord[]>([]);
  const [editingPost, setEditingPost] = useState<Partial<PostRecord> | null>(null);
  const [activeTab, setActiveTab] = useState('list');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (u && u.email === ADMIN_EMAIL) {
        fetchPosts();
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchPosts = async () => {
    const path = 'posts';
    try {
      const q = query(collection(db, path), orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      const fetchedPosts = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as PostRecord));
      setPosts(fetchedPosts);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  };

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setPosts([]);
  };

  const syncStaticPosts = async () => {
    if (!confirm("This will migrate all static posts to Firestore. Continue?")) return;
    
    for (const post of POSTS) {
      const path = `posts/${post.slug}`;
      try {
        await setDoc(doc(db, 'posts', post.slug), post);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
    }
    alert("Sync complete!");
    fetchPosts();
  };

  const savePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;

    const path = 'posts';
    try {
      const postData = {
        ...editingPost,
        date: editingPost.date || new Date().toISOString().split('T')[0],
        author: editingPost.author || {
          name: 'Admin',
          avatar: 'https://picsum.photos/seed/admin/100/100',
          role: 'Editor'
        }
      };

      if (editingPost.id) {
        await updateDoc(doc(db, 'posts', editingPost.id), postData);
      } else {
        const slug = editingPost.title?.toLowerCase().replace(/ /g, '-') || `post-${Date.now()}`;
        await setDoc(doc(db, 'posts', slug), { ...postData, slug });
      }

      setEditingPost(null);
      setActiveTab('list');
      fetchPosts();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const deletePostRecord = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    
    const path = `posts/${id}`;
    try {
      await deleteDoc(doc(db, 'posts', id));
      fetchPosts();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <SEO title="Admin Login" description="Admin access for TechNova" />
        <h1 className="text-2xl font-bold">Admin Portal</h1>
        <p className="text-muted-foreground">Please sign in with your authorized email.</p>
        <Button onClick={login}>Sign in with Google</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <SEO title="Admin Dashboard" description="Manage your blog posts" />
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Logged in as: {user.email}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={syncStaticPosts}>
            <RefreshCcw className="w-4 h-4 mr-2" /> Sync Static
          </Button>
          <Button variant="destructive" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="list">All Posts</TabsTrigger>
          <TabsTrigger value="edit" onClick={() => setEditingPost({})}>
            <Plus className="w-4 h-4 mr-2" /> New Post
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <div className="grid gap-4">
            {posts.map(post => (
              <Card key={post.id}>
                <CardHeader className="flex flex-row items-center justify-between py-4">
                  <div>
                    <CardTitle className="text-lg">{post.title}</CardTitle>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="secondary">{post.category}</Badge>
                      <span className="text-xs text-muted-foreground">{post.date}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => {
                      setEditingPost(post);
                      setActiveTab('edit');
                    }}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deletePostRecord(post.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="edit">
          <Card>
            <CardHeader>
              <CardTitle>{editingPost?.id ? 'Edit Post' : 'New Post'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={savePost} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input 
                    value={editingPost?.title || ''} 
                    onChange={e => setEditingPost({ ...editingPost, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Input 
                    value={editingPost?.category || ''} 
                    onChange={e => setEditingPost({ ...editingPost, category: e.target.value })}
                    placeholder="AI, Tech News, etc."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Excerpt</label>
                  <Input 
                    value={editingPost?.excerpt || ''} 
                    onChange={e => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cover Image URL</label>
                  <Input 
                    value={editingPost?.coverImage || ''} 
                    onChange={e => setEditingPost({ ...editingPost, coverImage: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Content (Markdown)</label>
                  <textarea 
                    className="flex min-h-[300px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={editingPost?.content || ''} 
                    onChange={e => setEditingPost({ ...editingPost, content: e.target.value })}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">
                    <Save className="w-4 h-4 mr-2" /> Save Post
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setActiveTab('list')}>
                    <X className="w-4 h-4 mr-2" /> Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
