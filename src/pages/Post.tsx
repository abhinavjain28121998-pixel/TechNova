import { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { POSTS as STATIC_POSTS, Post as StaticPost } from '../data/posts';
import { Badge } from '../components/ui/badge';
import { calculateReadingTime } from '../lib/utils';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { Calendar, Clock, ChevronLeft, Twitter, Linkedin, Link as LinkIcon, Loader2, Type, Minus, Plus, AlignLeft, Check, Edit2 } from 'lucide-react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

const ADMIN_EMAIL = 'abhinavj@leewayhertz.com';

import { format, parseISO } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import rehypeSlug from 'rehype-slug';
import GithubSlugger from 'github-slugger';
import { generateArticleSchema, generateBreadcrumbSchema, generateFAQSchema } from '../lib/seo';
import { usePost } from '../hooks/usePost';
import { usePosts } from '../hooks/usePosts';
import NotFound from './NotFound';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { PostComments } from '../components/PostComments';

const XIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export default function Post() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { post: fbPost, loading: loadingPost } = usePost(slug);
  const { posts: allPosts } = usePosts();
  
  // Readability state
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('lg');
  const [lineSpacing, setLineSpacing] = useState<'normal' | 'relaxed' | 'loose'>('relaxed');
  const [showControls, setShowControls] = useState(false);
  const [activeId, setActiveId] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAdmin(!!u && u.email === ADMIN_EMAIL);
    });
    return () => unsubscribe();
  }, []);

  const cleanContent = fbPost?.content ? fbPost.content.replace(/^#\s+.*$/gm, '').trim() : '';

  const toc = useMemo(() => {
    if (!cleanContent) return [];
    const slugger = new GithubSlugger();
    const regex = /^(#{2})\s+(.+)$/gm;
    const headings = [];
    let match;
    while ((match = regex.exec(cleanContent)) !== null) {
      const text = match[2].replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1').replace(/[*_~`]/g, '').trim();
      const id = slugger.slug(text);
      headings.push({
        level: match[1].length,
        text,
        id
      });
    }
    return headings;
  }, [cleanContent]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '0px 0px -80% 0px' }
    );

    const elements = document.querySelectorAll('h2');
    elements.forEach((elem) => observer.observe(elem));
    return () => observer.disconnect();
  }, [toc]);

  const increaseFontSize = () => {
    setFontSize(prev => {
      if (prev === 'sm') return 'base';
      if (prev === 'base') return 'lg';
      return 'xl';
    });
  };

  const decreaseFontSize = () => {
    setFontSize(prev => {
      if (prev === 'xl') return 'lg';
      if (prev === 'lg') return 'base';
      return 'sm';
    });
  };

  const toggleLineSpacing = () => {
    setLineSpacing(prev => {
      if (prev === 'normal') return 'relaxed';
      if (prev === 'relaxed') return 'loose';
      return 'normal';
    });
  };

  const fontSizeClass = {
    sm: 'prose-sm',
    base: 'prose-base',
    lg: 'prose-lg',
    xl: 'prose-xl',
  }[fontSize];

  
  const post = fbPost ? { ...fbPost, content: cleanContent } : null;

  if (!post && loadingPost) {
    return <div className="flex h-screen items-center justify-center bg-background"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  // Prevent viewing unauthorized drafts or non-existent posts
  if (!post || (post.status === 'draft')) {
    return <NotFound />;
  }

  // Use strictly Firestore posts for related
  const posts = allPosts.filter(p => !p.status || p.status === 'published');

  const relatedPosts = posts
    .filter(p => p.category === post.category && p.id !== post.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 2);

  const handleShareX = () => {
    if (!post) return;
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(post.title);
    window.open(`https://x.com/intent/tweet?url=${url}&text=${text}`, '_blank');
  };

  const handleShareLinkedIn = () => {
    if (!post) return;
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(post.title);
    window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}`, '_blank');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const articleSchema = generateArticleSchema(post);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Blog', item: '/blog' },
    { name: post.title, item: `/blog/${post.slug}` }
  ]);
  const faqSchema = post.faqs ? generateFAQSchema(post.faqs) : null;

  const schemas: any[] = [articleSchema, breadcrumbSchema];
  if (faqSchema) schemas.push(faqSchema);

  const rawDesc = post.metaDescription || post.excerpt || '';
  const seoDescription = rawDesc.length > 150 ? `${rawDesc.slice(0, 147).trim()}...` : rawDesc;

  return (
    <>
      <SEO 
        title={post.title}
        description={seoDescription}
        type="article"
        image={post.coverImage}
        author={post.author.name}
        publishedTime={post.date}
        keywords={post.tags}
        schema={schemas}
      />

      <article className="bg-background max-w-none" itemScope itemType="https://schema.org/BlogPosting">
        {/* Post Header */}
        <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 max-w-4xl">
          <div className="flex justify-between items-center mb-8">
            <Link to="/blog" className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors">
              <ChevronLeft className="w-4 h-4 mr-1" /> Back to blog
            </Link>
            {isAdmin && (
              <Button variant="outline" size="sm" onClick={() => navigate('/admin', { state: { editPost: post } })}>
                <Edit2 className="w-4 h-4 mr-2" /> Edit Post
              </Button>
            )}
          </div>
          
          <div className="mb-6">
            <Badge variant="secondary" className="text-sm px-3 py-1" itemProp="articleSection">{post.category}</Badge>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight mb-8 leading-tight" itemProp="headline">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
            <div className="flex items-center gap-3" itemProp="author" itemScope itemType="https://schema.org/Person">
              <img 
                src={post.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author?.name || 'User'}`} 
                alt={post.author?.name || 'Author'} 
                className="w-12 h-12 rounded-full bg-slate-800" 
                referrerPolicy="no-referrer" 
                itemProp="image" 
              />
              <div>
                <div className="flex items-center gap-2">
                  <div className="font-semibold text-foreground" itemProp="name">{post.author?.name || 'TechNova Team'}</div>
                  {post.isExpertVerified && (
                    <Badge variant="secondary" className="h-5 px-1.5 py-0 text-[10px] bg-primary/10 text-primary border-primary/20 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Verified Expert
                    </Badge>
                  )}
                </div>
                <div className="text-sm" itemProp="jobTitle">{post.author?.role || 'Guest Writer'}</div>
              </div>
            </div>
            
            <div className="hidden sm:block w-px h-8 bg-border"></div>
            
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <time 
                  dateTime={new Date(post.date).toISOString()} 
                  itemProp="datePublished dateModified"
                >
                  {format(parseISO(post.date), 'MMMM d, yyyy')}
                </time>
              </div>
              <div className="flex items-center gap-2" title="Estimated reading time">
                <Clock className="w-4 h-4" />
                <span>{calculateReadingTime(post.content)}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Cover Image */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl mb-12">
          <div className="aspect-video rounded-2xl overflow-hidden bg-muted border border-border">
            <img 
              src={post.coverImage || `https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1200&auto=format&fit=crop`} 
              alt={post.title} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              itemProp="image"
            />
          </div>
        </div>

        {/* Post Content & TOC Area */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[85rem] pb-20 flex flex-col md:flex-row gap-8 lg:gap-12 xl:gap-20">
          
          {/* Table of Contents - Sidebar on Desktop / Top block on Mobile */}
          <aside className="w-full md:w-56 lg:w-64 shrink-0">
            <div className="sticky top-28 bg-card border border-border p-6 rounded-2xl shadow-sm">
              <h3 className="font-bold text-lg mb-4 text-foreground flex items-center gap-2">
                Table of Contents
              </h3>
              <nav className="flex flex-col gap-3 text-sm">
                {toc.length > 0 ? (
                  toc.map(heading => (
                    <a 
                      key={heading.id} 
                      href={`#${heading.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById(heading.id)?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={`transition-colors block font-medium hover:text-primary ${
                        activeId === heading.id ? 'text-primary font-bold' : 'text-foreground'
                      }`}
                    >
                      {heading.text}
                    </a>
                  ))
                ) : (
                  <span className="text-muted-foreground italic">No quick links available.</span>
                )}
              </nav>
            </div>
          </aside>

          {/* Main Article Content */}
          <div className="flex-1 max-w-3xl min-w-0 mx-auto lg:mx-0 w-full">
            {/* Readability Controls */}
            <div className="mb-8 flex flex-col items-end">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowControls(!showControls)}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <Type className="w-4 h-4 mr-2" />
              Appearance
            </Button>
            
            {showControls && (
              <div className="mt-2 p-3 bg-card border border-border rounded-lg shadow-sm flex items-center gap-4 transition-all duration-200">
                <div className="flex items-center gap-2 border-r border-border pr-4">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mr-1">Text Size</span>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={decreaseFontSize} disabled={fontSize === 'sm'}>
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={increaseFontSize} disabled={fontSize === 'xl'}>
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mr-1">Spacing</span>
                  <Button variant="outline" size="sm" className="h-8 px-3" onClick={toggleLineSpacing}>
                    <AlignLeft className="h-3 w-3 mr-2" />
                    <span className="capitalize text-xs">{lineSpacing}</span>
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className={`prose prose-invert max-w-none prose-headings:font-bold prose-headings:scroll-mt-28 prose-a:text-primary hover:prose-a:text-primary/80 prose-img:rounded-xl prose-img:aspect-video prose-img:object-cover ${fontSizeClass} ${lineSpacing === 'normal' ? 'prose-p:leading-normal prose-li:leading-normal' : lineSpacing === 'loose' ? 'prose-p:leading-loose prose-li:leading-loose' : 'prose-p:leading-relaxed prose-li:leading-relaxed'}`}>
            <div itemProp="articleBody">
              <ReactMarkdown rehypePlugins={[rehypeSlug]}>{post.content}</ReactMarkdown>
            </div>
          </div>

          {post.faqs && post.faqs.length > 0 && (
            <div className="mt-16 bg-card border border-border p-6 sm:p-8 rounded-2xl shadow-sm">
              <h2 className="text-2xl font-bold text-foreground mb-6" id="frequently-asked-questions">Frequently Asked Questions</h2>
              <Accordion className="w-full">
                {post.faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border-border">
                    <AccordionTrigger className="text-left font-semibold hover:text-primary transition-colors data-[state=open]:text-primary">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed prose prose-invert prose-sm">
                      <ReactMarkdown>{faq.answer}</ReactMarkdown>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}

          <Separator className="my-12" />

          {/* Share & Tags */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-2 text-muted-foreground font-medium">
              <span>Share this article:</span>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="rounded-full" onClick={handleShareX} title="Share on X" aria-label="Share on X">
                  <XIcon className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full" onClick={handleShareLinkedIn} title="Share on LinkedIn" aria-label="Share on LinkedIn">
                  <Linkedin className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full" onClick={handleCopyLink} title="Copy Link" aria-label="Copy Link">
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <LinkIcon className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-muted-foreground mr-2">Tags:</span>
                {post.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="bg-muted hover:bg-muted/80 text-muted-foreground">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section className="bg-background py-16 border-t border-border mt-12 mb-8">
              <div className="container mx-auto px-0">
                <h2 className="text-2xl font-bold text-foreground mb-8">Related Articles</h2>
                <div className="grid sm:grid-cols-2 gap-8">
                  {relatedPosts.map(related => (
                    <article key={related.id} className="group block bg-card rounded-xl border border-border overflow-hidden hover:border-primary transition-colors">
                      <Link to={`/blog/${related.slug}`} aria-label={`Read article: ${related.title}`}>
                        <div className="aspect-video overflow-hidden">
                          <img 
                            src={related.coverImage || `https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800&auto=format&fit=crop`} 
                            alt={related.title} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            referrerPolicy="no-referrer"
                            loading="lazy"
                          />
                        </div>
                        <div className="p-6">
                          <Badge variant="secondary" className="mb-3">{related.category}</Badge>
                          <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors mb-2">
                            {related.title}
                          </h3>
                          <p className="text-muted-foreground text-sm line-clamp-2">
                            {related.excerpt}
                          </p>
                        </div>
                      </Link>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          )}

          <PostComments issueTerm={post.slug} />

        </div>
        </div>
      </article>
    </>
  );
}
