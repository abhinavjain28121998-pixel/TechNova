import { useState, useEffect, useRef } from 'react';
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
  User as UserIcon,
  MessageSquare,
  Paintbrush,
  Plug,
  Wrench,
  Search,
  Bell,
  Home,
  Image as ImageIcon,
  Files
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image is too large. Please select an image under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
        setEditingPost(prev => prev ? { ...prev, coverImage: dataUrl } : null);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };
  
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

      const cleanPostData = JSON.parse(JSON.stringify(postData));
      delete cleanPostData.id;

      if (editingPost.id) {
        await updateDoc(doc(db, 'posts', editingPost.id), cleanPostData);
      } else {
        const stopWords = ['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'like', 'through', 'over', 'before', 'between', 'after', 'since', 'without', 'under', 'within', 'along', 'following', 'across', 'behind', 'beyond', 'plus', 'except', 'but', 'up', 'out', 'around', 'down', 'off', 'above', 'near'];
        const titleWords = (editingPost.title || '').toLowerCase().split(/\s+/);
        const filteredTitle = titleWords.filter(word => !stopWords.includes(word)).join('-');
        
        const generatedSlug = filteredTitle.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || `post-${Date.now()}`;
        const slug = editingPost.slug || generatedSlug;
        
        await setDoc(doc(db, 'posts', slug), { ...cleanPostData, slug });
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
      <div className="flex flex-col items-center justify-center min-h-screen space-y-8 bg-[#f0f0f1] p-4 font-sans text-[#3c434a]">
        <SEO title="Log In ‹ TechNova — WordPress" description="Log In" noindex />
        <div className="w-full max-w-sm">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 bg-primary rounded-full flex items-center justify-center text-white text-4xl font-serif italic shadow-sm hover:opacity-90 transition-opacity">W</div>
          </div>
          <div className="bg-white p-6 border border-[#c3c4c7] shadow-sm">
            {user && user.email !== ADMIN_EMAIL && (
              <div className="mb-4 p-3 border-l-4 border-[#d63638] bg-[#fcf0f1] text-[#3c434a] text-sm">
                <strong>Error:</strong> Unauthorized access. Please log in with the admin account.
              </div>
            )}
            <Button onClick={login} className="w-full py-5 text-base border-none hover:bg-stone-900" variant="default" autoFocus>
              Log In
            </Button>
          </div>
          <div className="text-center mt-6">
            <a href="/" className="text-[#2271b1] hover:text-[#0a4b78] hover:underline text-sm">&larr; Go to TechNova</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f0f1] text-[#3c434a] font-sans flex flex-col md:flex-row pb-20 md:pb-0">
      <SEO title="Dashboard ‹ TechNova — WordPress" description="Admin Dashboard" noindex />

      {/* Sidebar Navigation */}
      <div className="w-full md:w-[160px] lg:w-[200px] xl:w-[260px] bg-[#1d2327] text-white flex-shrink-0 flex flex-col md:min-h-screen md:fixed md:top-0 md:left-0 z-20 overflow-y-auto">
        <div className="hidden md:flex p-4 items-center gap-2 border-b border-white/10 shrink-0">
          <div className="h-8 w-8 bg-primary rounded flex items-center justify-center text-white font-serif italic text-xl">W</div>
          <span className="font-semibold select-none">TechNova</span>
        </div>
        
        <nav className="flex-1 py-3 overflow-y-auto w-full flex md:block overflow-x-auto md:overflow-visible">
          <div className="px-2 mb-2 hidden md:block">
            <button className="w-full flex items-center gap-3 px-3 py-2 text-[#f0f0f1] hover:text-[#72aee6] active:bg-[#2271b1] hover:bg-white/5 disabled:opacity-50 text-sm mb-1 transition-colors">
              <Home className="w-4 h-4" /> Dashboard
            </button>
          </div>
          <div className="px-2 space-y-1 w-full flex md:block gap-1 md:gap-0">
            <button 
              onClick={() => setActiveTab('list')}
              className={`flex-shrink-0 md:w-full flex items-center gap-3 px-3 py-2 transition-colors text-sm break-keep whitespace-nowrap md:whitespace-normal
                ${activeTab === 'list' 
                  ? 'bg-primary text-white font-medium' 
                  : 'text-[#f0f0f1] hover:text-[#72aee6] hover:bg-white/5'
                }`}
            >
              <FileText className="w-4 h-4" /> Posts
            </button>
            <button 
              className="flex-shrink-0 md:w-full flex items-center gap-3 px-3 py-2 text-[#f0f0f1] hover:text-[#72aee6] hover:bg-white/5 disabled:opacity-50 text-sm whitespace-nowrap opacity-60 cursor-not-allowed"
            >
              <ImageIcon className="w-4 h-4" /> Media
            </button>
            <button 
              className="flex-shrink-0 md:w-full flex items-center gap-3 px-3 py-2 text-[#f0f0f1] hover:text-[#72aee6] hover:bg-white/5 disabled:opacity-50 text-sm whitespace-nowrap opacity-60 cursor-not-allowed"
            >
              <Files className="w-4 h-4" /> Pages
            </button>
            <button 
              className="flex-shrink-0 md:w-full flex items-center gap-3 px-3 py-2 text-[#f0f0f1] hover:text-[#72aee6] hover:bg-white/5 disabled:opacity-50 text-sm whitespace-nowrap opacity-60 cursor-not-allowed"
            >
              <MessageSquare className="w-4 h-4" /> Comments
            </button>
            <div className="my-2 border-t border-white/10 hidden md:block"></div>
            <button 
              className="flex-shrink-0 md:w-full flex items-center gap-3 px-3 py-2 text-[#f0f0f1] hover:text-[#72aee6] hover:bg-white/5 disabled:opacity-50 text-sm whitespace-nowrap opacity-60 cursor-not-allowed"
            >
              <Paintbrush className="w-4 h-4" /> Appearance
            </button>
            <button 
              className="flex-shrink-0 md:w-full flex items-center gap-3 px-3 py-2 text-[#f0f0f1] hover:text-[#72aee6] hover:bg-white/5 disabled:opacity-50 text-sm whitespace-nowrap opacity-60 cursor-not-allowed"
            >
              <Plug className="w-4 h-4" /> Plugins
            </button>
            <button 
              className="flex-shrink-0 md:w-full flex items-center gap-3 px-3 py-2 text-[#f0f0f1] hover:text-[#72aee6] hover:bg-white/5 disabled:opacity-50 text-sm whitespace-nowrap opacity-60 cursor-not-allowed"
            >
              <UserIcon className="w-4 h-4" /> Users
            </button>
            <button 
              className="flex-shrink-0 md:w-full flex items-center gap-3 px-3 py-2 text-[#f0f0f1] hover:text-[#72aee6] hover:bg-white/5 disabled:opacity-50 text-sm whitespace-nowrap opacity-60 cursor-not-allowed"
            >
              <Wrench className="w-4 h-4" /> Tools
            </button>
            <button 
              className="flex-shrink-0 md:w-full flex items-center gap-3 px-3 py-2 text-[#f0f0f1] hover:text-[#72aee6] hover:bg-white/5 disabled:opacity-50 text-sm whitespace-nowrap opacity-60 cursor-not-allowed"
            >
              <Settings className="w-4 h-4" /> Settings
            </button>
          </div>
        </nav>
      </div>

      {/* Main Panel Content */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-[160px] lg:ml-[200px] xl:ml-[260px]">
        {/* Top Header Bar */}
        <header className="h-14 bg-white md:bg-[#1d2327] md:text-white border-b border-[#c3c4c7] md:border-transparent flex items-center justify-between px-4 sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <span className="hidden md:flex items-center gap-2 font-medium hover:text-[#72aee6] cursor-pointer">
              <Home className="w-4 h-4" /> TechNova
            </span>
            <span className="flex md:hidden items-center gap-2 font-medium text-[#1d2327]">
              <div className="h-8 w-8 bg-primary rounded flex items-center justify-center text-white font-serif italic text-xl">W</div>
            </span>
            <Button 
              size="sm" 
              variant="outline" 
              className="h-8 md:border-white/20 md:text-white md:bg-white/5 md:hover:bg-white/10 border-[#2271b1] text-[#2271b1] hover:bg-[#135e96] hover:text-white"
              onClick={() => { setEditingPost({}); setActiveTab('edit'); setEditTab('content'); }}
            >
              <Plus className="w-4 h-4 mr-1 md:text-white" /> New Post
            </Button>
          </div>
          <div className="flex items-center gap-3 md:gap-4 text-[#3c434a] md:text-gray-300">
            <Search className="w-5 h-5 cursor-pointer hover:text-primary hidden sm:block md:hover:text-[#72aee6]" />
            <Bell className="w-5 h-5 cursor-pointer hover:text-primary hidden sm:block md:hover:text-[#72aee6]" />
            <div className="flex items-center gap-2 cursor-pointer md:hover:bg-white/5 hover:bg-gray-100 p-1 px-2 rounded group">
              <span className="text-sm hidden sm:block group-hover:text-primary md:group-hover:text-[#72aee6]">Howdy, {user.displayName || 'Admin'}</span>
              <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=admin`} alt="User" className="w-8 h-8 rounded-full border md:border-white/20 border-gray-200" referrerPolicy="no-referrer" />
            </div>
            <Button variant="ghost" size="icon" onClick={logout} title="Sign Out" className="md:hover:bg-white/5 md:text-white text-slate-500">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="p-4 md:p-6 lg:p-8 flex-1 overflow-auto w-full">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-[1200px] mx-auto">
            <TabsContent value="list" className="mt-0">
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h1 className="text-2xl font-normal text-[#1d2327]">Posts</h1>
                  <div className="flex gap-2">
                    <Input placeholder="Search posts..." className="h-9 w-full sm:w-64 border-[#8c8f94]" />
                    <Button variant="outline" className="h-9 border-[#8c8f94] whitespace-nowrap">Search Posts</Button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex gap-3 text-[#2271b1]">
                    <span className="font-semibold text-black cursor-pointer">All <span className="text-gray-500 font-normal">({posts.length})</span></span>
                    <span className="cursor-pointer hover:text-[#0a4b78]">Published <span className="text-gray-500">({posts.filter(p => p.status === 'published').length})</span></span>
                    <span className="cursor-pointer hover:text-[#0a4b78]">Draft <span className="text-gray-500">({posts.filter(p => !p.status || p.status === 'draft').length})</span></span>
                  </div>
                  {posts.length === 0 && (
                    <Button variant="outline" size="sm" onClick={syncStaticPosts} className="h-8 border-[#2271b1] text-[#2271b1]">
                      <RefreshCcw className="w-3 h-3 mr-2" /> Sync Seed Data
                    </Button>
                  )}
                </div>

                <div className="bg-white border border-[#c3c4c7] shadow-sm rounded-sm">
                  <div className="flex items-center gap-2 p-2 border-b border-[#c3c4c7] bg-[#f9f9f9]">
                    <select className="text-sm border border-[#8c8f94] rounded-sm px-2 py-1 h-8 bg-transparent">
                      <option>Bulk actions</option>
                      <option>Edit</option>
                      <option>Move to Trash</option>
                    </select>
                    <Button variant="outline" size="sm" className="h-8 border-[#8c8f94]">Apply</Button>
                    <select className="text-sm border border-[#8c8f94] rounded-sm px-2 py-1 h-8 ml-auto hidden sm:block bg-transparent">
                      <option>All dates</option>
                    </select>
                    <select className="text-sm border border-[#8c8f94] rounded-sm px-2 py-1 h-8 hidden sm:block bg-transparent">
                      <option>All Categories</option>
                    </select>
                    <Button variant="outline" size="sm" className="h-8 border-[#8c8f94] hidden sm:flex">Filter</Button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead>
                        <tr className="border-b border-[#c3c4c7]">
                          <th className="p-2 w-8 text-center"><input type="checkbox" className="rounded-sm border-[#8c8f94] cursor-pointer" /></th>
                          <th className="p-2 font-medium text-[#2c3338] hover:text-[#2271b1] cursor-pointer">Title</th>
                          <th className="p-2 font-medium text-[#2c3338] hover:text-[#2271b1] cursor-pointer">Author</th>
                          <th className="p-2 font-medium text-[#2c3338] hover:text-[#2271b1] cursor-pointer">Categories</th>
                          <th className="p-2 font-medium text-[#2c3338] hover:text-[#2271b1] cursor-pointer">Tags</th>
                          <th className="p-2 font-medium text-[#2c3338] hover:text-[#2271b1] cursor-pointer">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#c3c4c7]">
                        {posts.map((post, idx) => (
                          <tr key={post.id} className={idx % 2 === 0 ? 'bg-white group' : 'bg-[#f9f9f9] group'}>
                            <td className="p-2 text-center"><input type="checkbox" className="rounded-sm border-[#8c8f94] cursor-pointer" /></td>
                            <td className="p-2">
                              <div className="font-medium text-[#2271b1] hover:underline cursor-pointer" onClick={() => startEdit(post)}>
                                {post.title || '(no title)'} {post.status !== 'published' && <span className="font-bold text-black">— Draft</span>}
                              </div>
                              <div className="text-[11px] text-[#2271b1] mt-1 space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="cursor-pointer hover:text-black" onClick={() => startEdit(post)}>Edit</span>
                                <span className="text-[#a7aaad]">|</span>
                                <span className="text-[#d63638] cursor-pointer hover:text-black" onClick={() => deletePostRecord(post.id)}>Trash</span>
                                <span className="text-[#a7aaad]">|</span>
                                <span className="cursor-pointer hover:text-black" onClick={() => window.open(`/blog/${post.slug}`, '_blank')}>View</span>
                              </div>
                            </td>
                            <td className="p-2 text-[#2271b1] hover:underline cursor-pointer">{post.author?.name || 'Admin'}</td>
                            <td className="p-2 text-[#2271b1] hover:underline cursor-pointer">{post.category || 'Uncategorized'}</td>
                            <td className="p-2 text-[#2c3338] truncate max-w-[150px]">{post.tags?.join(', ') || '—'}</td>
                            <td className="p-2 text-[#2c3338]">
                              {post.status === 'published' ? 'Published' : 'Last Modified'}
                              <br/>
                              <span className="text-[#8c8f94]">{post.date ? new Date(post.date).toLocaleDateString() : 'N/A'}</span>
                            </td>
                          </tr>
                        ))}
                        {posts.length === 0 && (
                          <tr>
                            <td colSpan={6} className="p-4 text-center text-gray-500">No posts found.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center gap-2 p-2 border-t border-[#c3c4c7] bg-[#f9f9f9]">
                    <select className="text-sm border border-[#8c8f94] rounded-sm px-2 py-1 h-8 bg-transparent">
                      <option>Bulk actions</option>
                    </select>
                    <Button variant="outline" size="sm" className="h-8 border-[#8c8f94]">Apply</Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="edit" className="mt-0 space-y-6 pb-24">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-normal text-[#1d2327]">
                    {editingPost?.id ? 'Edit Post' : 'Add New Post'}
                  </h1>
                  <button className="border border-[#2271b1] text-[#2271b1] rounded-sm px-2 py-0.5 text-sm hover:bg-[#2271b1] hover:text-white transition-colors" onClick={() => setActiveTab('list')}>
                    Back to posts
                  </button>
                </div>
                {editingPost?.id && (
                   <a 
                     className="border border-[#8c8f94] text-[#2c3338] bg-white rounded-sm px-3 py-1 text-sm hover:bg-[#f0f0f1] transition-colors"
                     href={`/blog/${editingPost?.slug || ''}`} target="_blank" rel="noreferrer"
                   >
                     View Post
                   </a>
                )}
              </div>

              <div className="flex flex-col xl:flex-row gap-6 items-start">
                {/* Main Content Column */}
                <div className="flex-1 w-full space-y-4">
                  <Input 
                    placeholder="Add title"
                    className="w-full text-xl rounded-sm border-[#8c8f94] shadow-sm py-6 h-auto focus-visible:ring-1 focus-visible:ring-[#2271b1] focus-visible:border-[#2271b1] bg-white"
                    value={editingPost?.title || ''} 
                    onChange={e => setEditingPost({ ...editingPost, title: e.target.value })}
                  />

                  <div className="flex items-center gap-2 text-sm max-w-full overflow-hidden">
                    <span className="font-medium text-[#2c3338] shrink-0">Permalink:</span>
                    <a className="text-[#2271b1] hover:underline truncate" href={`/blog/${editingPost?.slug || 'new-post'}`} target="_blank" rel="noreferrer">
                      https://technova.com/blog/<span className="bg-[#fff9c2] px-1 rounded">{editingPost?.slug || 'new-post'}</span>
                    </a>
                  </div>

                  <div className="bg-white border border-[#c3c4c7] shadow-sm rounded-sm">
                    <div className="bg-[#f0f0f1] border-b border-[#c3c4c7] p-2 flex gap-1 items-center">
                       <Button variant="ghost" size="sm" className={`h-8 ${editTab === 'content' ? 'bg-white border border-[#c3c4c7] border-b-transparent shadow-none text-black relative top-[1px]' : 'hover:bg-[#c3c4c7] text-[#2c3338]'}`} onClick={() => setEditTab('content')}><Edit2 className="w-4 h-4 mr-1"/> Write</Button>
                       <Button variant="ghost" size="sm" className={`h-8 ${editTab === 'preview' ? 'bg-white border border-[#c3c4c7] border-b-transparent shadow-none text-black relative top-[1px]' : 'hover:bg-[#c3c4c7] text-[#2c3338]'}`} onClick={() => setEditTab('preview')}><Eye className="w-4 h-4 mr-1"/> Preview</Button>
                    </div>

                    {editTab === 'content' && (
                      <textarea 
                        className="w-full min-h-[500px] border-none p-4 font-mono text-[13px] text-[#2c3338] focus:outline-none resize-y"
                        placeholder="Start typing or insert Markdown..."
                        value={editingPost?.content || ''} 
                        onChange={e => setEditingPost({ ...editingPost, content: e.target.value })}
                      />
                    )}

                    {editTab === 'preview' && (
                      <div className="w-full min-h-[500px] p-6 max-w-none prose prose-slate">
                        {editingPost?.content ? (
                          <ReactMarkdown
                            components={{
                              a: ({ node, ...props }) => <a target="_blank" rel="noopener noreferrer" {...props} />
                            }}
                          >
                            {editingPost.content}
                          </ReactMarkdown>
                        ) : (
                          <p className="text-gray-400 italic">Preview will appear here...</p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Excerpt panel */}
                  <div className="bg-white border border-[#c3c4c7] shadow-sm rounded-sm mt-4">
                    <div className="border-b border-[#c3c4c7] px-4 py-3 bg-white font-medium text-[#1d2327]">
                      Excerpt
                    </div>
                    <div className="p-4">
                      <textarea 
                        className="w-full h-24 border border-[#8c8f94] rounded-sm p-3 text-sm focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
                        placeholder="Write a custom excerpt..."
                        value={editingPost?.excerpt || ''} 
                        onChange={e => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                      />
                      <p className="text-[#646970] text-xs mt-1">Excerpts are optional hand-crafted summaries of your content that can be used in your theme.</p>
                    </div>
                  </div>
                  
                  {/* Author panel */}
                  <div className="bg-white border border-[#c3c4c7] shadow-sm rounded-sm mt-4">
                    <div className="border-b border-[#c3c4c7] px-4 py-3 bg-white font-medium text-[#1d2327]">
                      Author Information
                    </div>
                    <div className="p-4 grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block text-[#2c3338]">Name</label>
                        <Input 
                          className="border-[#8c8f94] h-9" 
                          value={editingPost?.author?.name || ''} 
                          onChange={e => setEditingPost({ ...editingPost, author: { ...(editingPost.author || { avatar: '', role: '' }), name: e.target.value } })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block text-[#2c3338]">Role</label>
                        <Input 
                          className="border-[#8c8f94] h-9" 
                          value={editingPost?.author?.role || ''} 
                          onChange={e => setEditingPost({ ...editingPost, author: { ...(editingPost.author || { avatar: '', name: '' }), role: e.target.value } })}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Sidebar Column */}
                <div className="w-full xl:w-[280px] shrink-0 space-y-4">
                  {/* Publish Box */}
                  <div className="bg-white border border-[#c3c4c7] shadow-sm rounded-sm">
                    <div className="border-b border-[#c3c4c7] px-3 py-2 bg-white font-medium text-[#1d2327] flex items-center justify-between">
                      Publish
                    </div>
                    <div className="p-3 space-y-3 border-b border-[#c3c4c7]">
                      <div className="flex justify-between items-center text-sm">
                        <Button variant="outline" size="sm" className="h-8 border-[#2271b1] text-[#2271b1]" onClick={() => setEditingPost({...editingPost, status: 'draft'})}>Save Draft</Button>
                        <Button variant="outline" size="sm" className="h-8 border-[#8c8f94]" onClick={() => setEditTab('preview')}>Preview</Button>
                      </div>
                      
                      <div className="text-[13px] text-[#2c3338] space-y-2 pt-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className={`w-4 h-4 ${editingPost?.status === 'published' ? 'text-[#00a32a]' : 'text-gray-400'}`} /> 
                          Status: <span className="font-semibold capitalize">{editingPost?.status || 'Draft'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          Publish: <input type="datetime-local" className="bg-transparent border-none text-[13px] p-0 h-auto font-semibold text-[#2271b1] underline" value={editingPost?.date ? new Date(editingPost.date).toISOString().slice(0, 16) : ''} onChange={e => setEditingPost({ ...editingPost, date: new Date(e.target.value).toISOString() })} />
                        </div>
                        <div className="flex items-center gap-2">
                          <CircleDashed className="w-4 h-4 text-gray-400" />
                          Read Time: <Input className="h-6 text-[13px] w-20 px-1 border-[#8c8f94]" value={editingPost?.readingTime || ''} onChange={e => setEditingPost({ ...editingPost, readingTime: e.target.value })} placeholder="5 min" />
                        </div>
                        <div className="flex items-center gap-2">
                           <FileText className="w-4 h-4 text-gray-400" />
                           Slug: <Input className="h-6 text-[13px] w-32 px-1 border-[#8c8f94]" value={editingPost?.slug || ''} onChange={e => setEditingPost({ ...editingPost, slug: e.target.value })} placeholder="Custom URL" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-[#f6f7f7] flex items-center justify-between rounded-b-sm">
                      <button className="text-[#d63638] hover:text-[#d63638] p-0 h-auto text-[13px] underline bg-transparent" onClick={() => editingPost?.id && deletePostRecord(editingPost.id)}>Move to Trash</button>
                      <Button 
                        size="sm" 
                        onClick={() => savePost()} 
                        className="bg-[#2271b1] hover:bg-[#135e96] text-white h-8 text-[13px] rounded-sm"
                      >
                        {editingPost?.status === 'published' ? 'Update' : 'Publish'}
                      </Button>
                    </div>
                  </div>

                  {/* Categories Box */}
                  <div className="bg-white border border-[#c3c4c7] shadow-sm rounded-sm">
                    <div className="border-b border-[#c3c4c7] px-3 py-2 bg-white font-medium text-[#1d2327]">
                      Categories
                    </div>
                    <div className="p-3">
                      <Input 
                        placeholder="Select or enter category..." 
                        className="border-[#8c8f94] h-8 text-sm"
                        value={editingPost?.category || ''} 
                        onChange={e => setEditingPost({ ...editingPost, category: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Tags Box */}
                  <div className="bg-white border border-[#c3c4c7] shadow-sm rounded-sm">
                    <div className="border-b border-[#c3c4c7] px-3 py-2 bg-white font-medium text-[#1d2327]">
                      Tags
                    </div>
                    <div className="p-3">
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Add new tag" 
                          className="border-[#8c8f94] h-8 text-sm flex-1"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const newTag = e.currentTarget.value.trim();
                              if (newTag) {
                                setEditingPost({ 
                                  ...editingPost, 
                                  tags: [...(editingPost?.tags || []), newTag] 
                                });
                                e.currentTarget.value = '';
                              }
                            }
                          }}
                        />
                        <Button variant="outline" size="sm" className="h-8 border-[#8c8f94]" onClick={(e) => {
                           const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                           const newTag = input.value.trim();
                           if (newTag) {
                             setEditingPost({ 
                                ...editingPost, 
                                tags: [...(editingPost?.tags || []), newTag] 
                             });
                             input.value = '';
                           }
                        }}>Add</Button>
                      </div>
                      <p className="text-xs text-[#646970] mt-2 italic">Separate tags with commas. Press Enter to add.</p>
                      
                      <div className="mt-3 flex flex-wrap gap-2">
                        {editingPost?.tags?.map((tag, i) => (
                          <div key={i} className="flex items-center gap-1 bg-[#f0f0f1] px-2 py-0.5 rounded text-xs border border-[#c3c4c7]">
                            <button className="text-gray-500 hover:text-red-500 rounded-full hover:bg-[#c3c4c7] p-0.5" onClick={() => setEditingPost({...editingPost, tags: editingPost.tags?.filter(t => t !== tag)})}>
                              <X className="w-3 h-3" />
                            </button>
                            {tag}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Featured Image Box */}
                  <div className="bg-white border border-[#c3c4c7] shadow-sm rounded-sm">
                    <div className="border-b border-[#c3c4c7] px-3 py-2 bg-white font-medium text-[#1d2327]">
                      Featured Image
                    </div>
                    <div className="p-3">
                      {editingPost?.coverImage ? (
                        <div className="space-y-3">
                          <img src={editingPost.coverImage} className="w-full h-auto border border-[#c3c4c7]" alt="Featured" />
                          <div className="space-y-2">
                            <Input 
                              placeholder="Image URL" 
                              className="border-[#8c8f94] h-8 text-sm"
                              value={editingPost?.coverImage || ''} 
                              onChange={e => setEditingPost({ ...editingPost, coverImage: e.target.value })}
                            />
                            <button className="text-[#d63638] h-auto text-sm underline bg-transparent px-0 hover:bg-transparent" onClick={() => setEditingPost({...editingPost, coverImage: ''})}>
                              Remove featured image
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <button className="text-[#2271b1] px-0 h-auto text-sm underline bg-transparent hover:bg-transparent" onClick={(e) => { e.preventDefault(); fileInputRef.current?.click(); }}>
                            Set featured image (Upload)
                          </button>
                          <p className="text-xs text-[#646970] text-center my-1">OR</p>
                          <Input 
                              placeholder="Paste Image URL here" 
                              className="border-[#8c8f94] h-8 text-sm"
                              value={editingPost?.coverImage || ''} 
                              onChange={e => setEditingPost({ ...editingPost, coverImage: e.target.value })}
                            />
                        </div>
                      )}
                      <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                    </div>
                  </div>

                  {/* Settings Box */}
                  <div className="bg-white border border-[#c3c4c7] shadow-sm rounded-sm">
                    <div className="border-b border-[#c3c4c7] px-3 py-2 bg-white font-medium text-[#1d2327]">
                      Post Attributes
                    </div>
                    <div className="p-4 space-y-3">
                      <label className="flex items-center gap-2 text-sm text-[#2c3338] cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="rounded-sm border-[#8c8f94] text-[#2271b1] focus:ring-[#2271b1]" 
                          checked={editingPost?.featured || false}
                          onChange={e => setEditingPost({ ...editingPost, featured: e.target.checked })}
                        />
                        Featured Post
                      </label>
                      <label className="flex items-center gap-2 text-sm text-[#2c3338] cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="rounded-sm border-[#8c8f94] text-[#2271b1] focus:ring-[#2271b1]" 
                          checked={editingPost?.trending || false}
                          onChange={e => setEditingPost({ ...editingPost, trending: e.target.checked })}
                        />
                        Mark as Trending
                      </label>
                      <label className="flex items-center gap-2 text-sm text-[#2c3338] cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="rounded-sm border-[#8c8f94] text-[#2271b1] focus:ring-[#2271b1]" 
                          checked={editingPost?.isExpertVerified || false}
                          onChange={e => setEditingPost({ ...editingPost, isExpertVerified: e.target.checked })}
                        />
                        Expert Verified (EEAT)
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
