import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  setDoc,
  Timestamp
} from 'firebase/firestore';
import { OperationType, handleFirestoreError } from '../lib/firestoreUtils';
import { POSTS as STATIC_POSTS, Post as StaticPost } from '../data/posts';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Plus, 
  LogOut, 
  Edit2, 
  Trash2, 
  RefreshCcw, 
  Save, 
  X, 
  Settings, 
  FileText, 
  Eye, 
  ArrowLeft,
  LayoutDashboard,
  CheckCircle2,
  Clock,
  CircleDashed,
  User as UserIcon
} from 'lucide-react';
import { SEO } from '../components/SEO';
import ReactMarkdown from 'react-markdown';

const ADMIN_EMAIL = 'abhinavj@leewayhertz.com';

interface PostRecord extends StaticPost {
  id: string;
  status?: 'draft' | 'published';
}

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<PostRecord[]>([]);
  const [editingPost, setEditingPost] = useState<Partial<PostRecord> | null>(null);
  const [activeTab, setActiveTab] = useState('list');
  const [editTab, setEditTab] = useState('content');
  
  const location = useLocation();
  const navigate = useNavigate();

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

  useEffect(() => {
    if (location.state?.editPost && user?.email === ADMIN_EMAIL && !loading) {
      setEditingPost(location.state.editPost as PostRecord);
      setActiveTab('edit');
      // Replace the location state so it doesn't trigger again on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, user, loading, navigate]);

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
    } catch (error: any) {
      console.error("Login failed", error);
      if (error.code === 'auth/unauthorized-domain') {
        alert("Domain Not Authorized. To fix this:\n\n1. Go to Firebase Console\n2. Click Authentication -> Settings -> Authorized domains\n3. Add 'tech-nova-iota.vercel.app'\n\nThis is a standard security protection from Firebase.");
      } else {
        alert(`Login failed: ${error.message}`);
      }
    }
  };

  const logout = async () => {
    await signOut(auth);
    setPosts([]);
  };

  const syncStaticPosts = async () => {
    if (!confirm("This will migrate all static posts to Firestore. Existing Firestore posts with same slugs will be overwritten. Continue?")) return;
    
    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    for (const post of STATIC_POSTS) {
      const path = `posts/${post.slug}`;
      try {
        await setDoc(doc(db, 'posts', post.slug), {
          ...post,
          status: 'published'
        });
        successCount++;
      } catch (error: any) {
        failCount++;
        errors.push(`${post.slug}: ${error.message}`);
        console.error(`Sync failed for ${post.slug}:`, error);
      }
    }

    if (failCount === 0) {
      alert(`Sync complete! Successfully updated ${successCount} articles.`);
    } else {
      alert(`Sync finished with issues.\nSuccess: ${successCount}\nFailed: ${failCount}\n\nErrors:\n${errors.join('\n')}`);
    }
    
    fetchPosts();
  };

  const savePost = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingPost) return;

    const path = 'posts';
    try {
      const postData = {
        ...editingPost,
        date: editingPost.date || new Date().toISOString(),
        status: editingPost.status || 'draft',
        author: editingPost.author || {
          name: 'TechNova Team',
          avatar: 'https://picsum.photos/seed/technova/100/100',
          role: 'Editor'
        }
      };

      if (editingPost.id) {
        await updateDoc(doc(db, 'posts', editingPost.id), postData);
      } else {
        const stopWords = ['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'like', 'through', 'over', 'before', 'between', 'after', 'since', 'without', 'under', 'within', 'along', 'following', 'across', 'behind', 'beyond', 'plus', 'except', 'but', 'up', 'out', 'around', 'down', 'off', 'above', 'near'];
        const titleWords = (editingPost.title || '').toLowerCase().split(/\s+/);
        const filteredTitle = titleWords.filter(word => !stopWords.includes(word)).join('-');
        
        const generatedSlug = filteredTitle.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || `post-${Date.now()}`;
        const slug = editingPost.slug || generatedSlug;
        
        await setDoc(doc(db, 'posts', slug), { ...postData, slug });
      }

      setEditingPost(null);
      setActiveTab('list');
      fetchPosts();
      alert("Post saved successfully!");
    } catch (error: any) {
      console.error("Save failed:", error);
      alert(`Failed to save post. Error: ${error.message}`);
    }
  };

  const deletePostRecord = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post? This cannot be undone.")) return;
    
    // Optimistically remove from UI
    setPosts(prev => prev.filter(p => p.id !== id));
    
    const path = `posts/${id}`;
    try {
      await deleteDoc(doc(db, 'posts', id));
      // Re-fetch to guarantee sync with server
      fetchPosts();
    } catch (error: any) {
      console.error("Failed to delete post:", error);
      alert(`Failed to delete the blog post. Make sure you have the correct permissions. Error: ${error.message}`);
      // Re-fetch to revert the optimistic UI update if it failed
      fetchPosts();
    }
  };

  const startEdit = (post: Partial<PostRecord>) => {
    setEditingPost(post);
    setActiveTab('edit');
    setEditTab('content');
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <RefreshCcw className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-mono uppercase tracking-widest text-muted-foreground">Initializing Admin Panel</p>
      </div>
    </div>
  );

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-8 bg-[#0a0a0a] p-4 font-mono">
        <SEO title="Admin Login" description="Restricted Access Area" />
        
        <div className="w-full max-w-md border border-white/10 bg-white/5 p-8 rounded-lg shadow-2xl backdrop-blur-sm">
          <div className="flex flex-col items-center mb-8">
            <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center mb-4">
              <span className="text-primary-foreground font-bold text-2xl">T</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-widest uppercase">TechNova | Mission Control</h1>
            <p className="text-xs text-white/40 mt-2">SECURE ENDPOINT v2.0</p>
          </div>

          <div className="space-y-6">
            <div className="p-4 border border-yellow-500/20 bg-yellow-500/5 text-yellow-500 text-xs rounded leading-relaxed">
              [WARNING] Restricted area. Unauthorized access attempts are monitored. 
              Please authenticate with the primary administrator account.
            </div>
            
            <Button onClick={login} className="w-full py-6 font-bold tracking-widest uppercase text-xs" variant="default">
              Initialize Google Auth
            </Button>

            <div className="flex items-center justify-center gap-2 pt-4 opacity-30">
              <div className="h-[1px] w-8 bg-white/20"></div>
              <span className="text-[10px] text-white">SYSTEM READY</span>
              <div className="h-[1px] w-8 bg-white/20"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-slate-300 font-sans selection:bg-primary/30">
      <SEO title="Mission Control" description="TechNova Backend" />
      
      {/* Sidebar Navigation */}
      <div className="fixed left-0 top-0 bottom-0 w-16 md:w-64 border-r border-white/5 bg-black/40 backdrop-blur-xl hidden sm:flex flex-col">
        <div className="p-4 border-b border-white/5 h-16 flex items-center gap-3">
          <div className="h-8 w-8 rounded bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-primary-foreground font-bold">T</span>
          </div>
          <span className="font-bold text-white hidden md:block">Mission Control</span>
        </div>
        
        <nav className="flex-grow py-6 px-3 space-y-1">
          <button 
            onClick={() => setActiveTab('list')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all ${activeTab === 'list' ? 'bg-primary/10 text-primary border border-primary/20' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium text-sm hidden md:block">All Content</span>
          </button>
          <button 
            onClick={() => { setEditingPost({}); setActiveTab('edit'); setEditTab('content'); }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all ${activeTab === 'edit' ? 'bg-primary/10 text-primary border border-primary/20' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium text-sm hidden md:block">New Entry</span>
          </button>
        </nav>

        <div className="p-4 border-t border-white/5">
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-all">
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm hidden md:block">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Panel */}
      <div className="sm:ml-16 md:ml-64 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Header Area */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-primary mb-2 font-mono">Terminal / {activeTab === 'list' ? 'Dashboard' : 'Editor'}</p>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">{activeTab === 'list' ? 'Content Management' : (editingPost?.id ? 'Edit Entry' : 'Create New Entry')}</h1>
            </div>
            
            {activeTab === 'list' && (
              <Button variant="outline" size="sm" onClick={syncStaticPosts} className="font-mono text-[10px] uppercase border-white/10 bg-white/5 hover:bg-white/10 h-9">
                <RefreshCcw className="w-3 h-3 mr-2" /> RE-SYNC SEED DATA
              </Button>
            )}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsContent value="list" className="mt-0">
              <div className="grid gap-4">
                {posts.length === 0 ? (
                  <div className="border border-dashed border-white/10 rounded-xl p-20 flex flex-col items-center text-center">
                    <FileText className="w-12 h-12 text-slate-700 mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">No content records found</h3>
                    <p className="text-sm text-slate-500 max-w-xs mb-6">Your Firestore database is currently empty. Start by syncing static data or creating a new post.</p>
                    <div className="flex gap-4">
                      <Button onClick={() => { setEditingPost({}); setActiveTab('edit'); setEditTab('content'); }}>Create First Entry</Button>
                      <Button variant="outline" onClick={syncStaticPosts}>Sync Seed Data</Button>
                    </div>
                  </div>
                ) : (
                  <div className="border border-white/5 bg-black/20 rounded-xl overflow-hidden shadow-sm">
                    {/* List Headers */}
                    <div className="grid grid-cols-[1fr_120px_120px_100px] gap-4 px-6 py-3 bg-white/5 border-b border-white/5 text-[10px] font-mono uppercase tracking-wider text-slate-500">
                      <span>Article Title</span>
                      <span>Category</span>
                      <span>Status</span>
                      <span className="text-right">Actions</span>
                    </div>
                    
                    {/* Rows */}
                    {posts.map(post => (
                      <div key={post.id} className="grid grid-cols-[1fr_120px_120px_100px] gap-4 px-6 py-4 border-b border-white/5 items-center hover:bg-white/[0.02] transition-colors group">
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-white group-hover:text-primary transition-colors truncate">{post.title || 'Untitled'}</span>
                          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-600 truncate">
                            <span>/{post.slug || 'no-slug'}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><UserIcon className="w-2.5 h-2.5" /> {post.author?.name || 'TechNova Team'}</span>
                            <span>•</span>
                            <span>{post.date ? new Date(post.date).toLocaleDateString() : 'Unpublished'}</span>
                            {post.featured && <span className="px-1 py-[1px] bg-primary/20 text-primary border border-primary/20 rounded">Featured</span>}
                          </div>
                        </div>
                        
                        <div>
                          <Badge variant="outline" className="border-white/10 bg-white/5 text-[10px] font-mono px-2 py-0 h-5">
                            {post.category}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {post.status === 'published' ? (
                            <div className="flex items-center gap-1.5 text-emerald-500">
                              <CheckCircle2 className="w-3 h-3" />
                              <span className="text-[10px] font-mono uppercase">Live</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-amber-500">
                              <CircleDashed className="w-3 h-3" />
                              <span className="text-[10px] font-mono uppercase">Draft</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/20 hover:text-primary" onClick={() => startEdit(post)}>
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-500/20 hover:text-red-500" onClick={() => deletePostRecord(post.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="edit" className="mt-0 space-y-6">
              <div className="flex items-center justify-between mb-8 sticky top-20 bg-[#0d0d0d]/90 backdrop-blur pb-4 z-10 border-b border-white/5">
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('list')} className="text-slate-500 hover:text-white">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                </Button>
                
                <div className="flex gap-3">
                   <div className="flex border border-white/10 rounded-md p-0.5 bg-black/40">
                    <button 
                      onClick={() => setEditingPost({...editingPost, status: 'draft'})}
                      className={`px-3 py-1 text-[10px] uppercase font-mono rounded transition-all ${editingPost?.status === 'draft' || !editingPost?.status ? 'bg-amber-500/20 text-amber-500' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      Draft
                    </button>
                    <button 
                      onClick={() => setEditingPost({...editingPost, status: 'published'})}
                      className={`px-3 py-1 text-[10px] uppercase font-mono rounded transition-all ${editingPost?.status === 'published' ? 'bg-emerald-500/20 text-emerald-500' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      Published
                    </button>
                  </div>
                  <Button onClick={() => savePost()} className="font-bold uppercase text-[10px] h-9">
                    <Save className="w-4 h-4 mr-2" /> Commit Changes
                  </Button>
                </div>
              </div>

              <div className="grid lg:grid-cols-4 gap-8">
                {/* Main Content Pane */}
                <div className="lg:col-span-3 space-y-6">
                  <div className="space-y-4">
                    <Input 
                      className="text-2xl md:text-4xl font-black bg-transparent border-none px-0 h-auto focus-visible:ring-0 placeholder:text-slate-800"
                      placeholder="Article Title..."
                      value={editingPost?.title || ''} 
                      onChange={e => setEditingPost({ ...editingPost, title: e.target.value })}
                    />
                    
                    <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
                      <span className="flex items-center gap-1.5"><FileText className="w-3 h-3" /> Permalink: /{editingPost?.slug || '...'}</span>
                      <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {editingPost?.readingTime || '0 min'} read</span>
                    </div>
                  </div>

                  <Tabs value={editTab} onValueChange={setEditTab} className="bg-black/30 rounded-xl border border-white/5 overflow-hidden">
                    <TabsList className="bg-white/5 border-b border-white/5 w-full justify-start rounded-none h-12 px-4 gap-6">
                      <TabsTrigger value="content" className="data-[state=active]:bg-transparent data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary rounded-none h-12 uppercase text-[10px] font-mono tracking-widest">
                        <FileText className="w-3.5 h-3.5 mr-2" /> Editor
                      </TabsTrigger>
                      <TabsTrigger value="preview" className="data-[state=active]:bg-transparent data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary rounded-none h-12 uppercase text-[10px] font-mono tracking-widest">
                        <Eye className="w-3.5 h-3.5 mr-2" /> Live Preview
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="content" className="p-0 m-0">
                      <textarea 
                        className="w-full min-h-[600px] bg-transparent p-8 text-slate-300 font-mono text-sm leading-relaxed focus:outline-none resize-none"
                        placeholder="Write something brilliant in Markdown..."
                        value={editingPost?.content || ''} 
                        onChange={e => setEditingPost({ ...editingPost, content: e.target.value })}
                      />
                    </TabsContent>
                    
                    <TabsContent value="preview" className="p-0 m-0">
                      <div className="p-8 prose prose-invert max-w-none prose-headings:font-black prose-p:text-slate-400 prose-slate prose-img:rounded-xl">
                        {editingPost?.content ? (
                          <ReactMarkdown>{editingPost.content}</ReactMarkdown>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-20 text-slate-600 italic">
                            No content yet. Start writing to see the preview.
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Sidebar Pane */}
                <div className="space-y-6">
                  <Card className="bg-white/5 border-white/10 text-white">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-xs font-mono uppercase tracking-widest flex items-center gap-2">
                        <Settings className="w-3.5 h-3.5" /> Properties
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-mono text-slate-500">Publish Date</label>
                        <Input 
                          type="datetime-local"
                          className="bg-black/20 border-white/10 text-sm h-8 cursor-pointer"
                          value={editingPost?.date ? new Date(editingPost.date).toISOString().slice(0, 16) : ''} 
                          onChange={e => setEditingPost({ ...editingPost, date: new Date(e.target.value).toISOString() })}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-mono text-slate-500">Category</label>
                        <Input 
                          placeholder="e.g. AI, Development"
                          className="bg-black/20 border-white/10 text-sm h-8"
                          value={editingPost?.category || ''} 
                          onChange={e => setEditingPost({ ...editingPost, category: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-mono text-slate-500">Tags (Comma Separated)</label>
                        <Input 
                          placeholder="e.g. Protocol, Guide, Web"
                          className="bg-black/20 border-white/10 text-sm h-8"
                          value={editingPost?.tags?.join(', ') || ''} 
                          onChange={e => setEditingPost({ ...editingPost, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-mono text-slate-500">Custom Slug</label>
                        <Input 
                          placeholder="URL identifier"
                          className="bg-black/20 border-white/10 text-sm h-8"
                          value={editingPost?.slug || ''} 
                          onChange={e => setEditingPost({ ...editingPost, slug: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-mono text-slate-500">Reading Time</label>
                        <Input 
                          placeholder="e.g. 5 min read"
                          className="bg-black/20 border-white/10 text-sm h-8"
                          value={editingPost?.readingTime || ''} 
                          onChange={e => setEditingPost({ ...editingPost, readingTime: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2 pt-2">
                        <div className="flex items-center justify-between p-3 rounded-md border border-white/10 bg-black/20 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => setEditingPost(prev => ({ ...prev, featured: !prev?.featured }))}>
                          <label className="text-xs font-mono text-slate-300 pointer-events-none">Featured Post</label>
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 accent-primary cursor-pointer" 
                            checked={editingPost?.featured || false} 
                            onClick={e => e.stopPropagation()}
                            onChange={e => setEditingPost({ ...editingPost, featured: e.target.checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-md border border-white/10 bg-black/20 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => setEditingPost(prev => ({ ...prev, trending: !prev?.trending }))}>
                          <label className="text-xs font-mono text-slate-300 pointer-events-none">Trending</label>
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 accent-primary cursor-pointer" 
                            checked={editingPost?.trending || false} 
                            onClick={e => e.stopPropagation()}
                            onChange={e => setEditingPost({ ...editingPost, trending: e.target.checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-md border border-white/10 bg-black/20 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => setEditingPost(prev => ({ ...prev, isExpertVerified: !prev?.isExpertVerified }))}>
                          <label className="text-xs font-mono text-slate-300 pointer-events-none">Expert Verified (EEAT)</label>
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 accent-primary cursor-pointer" 
                            checked={editingPost?.isExpertVerified || false} 
                            onClick={e => e.stopPropagation()}
                            onChange={e => setEditingPost({ ...editingPost, isExpertVerified: e.target.checked })}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/5 border-white/10 text-white">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-xs font-mono uppercase tracking-widest flex items-center gap-2">
                        <UserIcon className="w-3.5 h-3.5" /> Author Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-mono text-slate-500">Author Name</label>
                        <Input 
                          placeholder="e.g. Jane Doe"
                          className="bg-black/20 border-white/10 text-sm h-8"
                          value={editingPost?.author?.name || ''} 
                          onChange={e => setEditingPost({ ...editingPost, author: { ...(editingPost.author || { avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TechNova', role: 'Editor' }), name: e.target.value } })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-mono text-slate-500">Author Role</label>
                        <Input 
                          placeholder="e.g. Senior Editor"
                          className="bg-black/20 border-white/10 text-sm h-8"
                          value={editingPost?.author?.role || ''} 
                          onChange={e => setEditingPost({ ...editingPost, author: { ...(editingPost.author || { name: 'TechNova Team', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TechNova' }), role: e.target.value } })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-mono text-slate-500">Avatar URL</label>
                        <Input 
                          placeholder="https://..."
                          className="bg-black/20 border-white/10 text-sm h-8"
                          value={editingPost?.author?.avatar || ''} 
                          onChange={e => setEditingPost({ ...editingPost, author: { ...(editingPost.author || { name: 'TechNova Team', role: 'Editor' }), avatar: e.target.value } })}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/5 border-white/10 text-white">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-xs font-mono uppercase tracking-widest flex items-center gap-2">
                        Metadata
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-mono text-slate-500">Excerpt</label>
                        <textarea 
                          className="w-full bg-black/20 border border-white/10 rounded-md p-3 text-xs text-slate-400 focus:outline-none focus:border-primary min-h-[100px]"
                          placeholder="Short summary for SEO and lists..."
                          value={editingPost?.excerpt || ''} 
                          onChange={e => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-mono text-slate-500">Cover Image URL</label>
                        <Input 
                          placeholder="https://images.unsplash..."
                          className="bg-black/20 border-white/10 text-xs h-8"
                          value={editingPost?.coverImage || ''} 
                          onChange={e => setEditingPost({ ...editingPost, coverImage: e.target.value })}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
