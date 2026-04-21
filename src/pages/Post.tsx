import { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { POSTS as STATIC_POSTS, Post as StaticPost } from '../data/posts';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { Calendar, Clock, ChevronLeft, Twitter, Linkedin, Link as LinkIcon, Loader2, Type, Minus, Plus, AlignLeft } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import rehypeSlug from 'rehype-slug';
import GithubSlugger from 'github-slugger';
import { generateArticleSchema, generateBreadcrumbSchema } from '../lib/seo';
import { usePost } from '../hooks/usePost';
import { usePosts } from '../hooks/usePosts';
import NotFound from './NotFound';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';

export default function Post() {
  const { slug } = useParams<{ slug: string }>();
  const { post: fbPost, loading: loadingPost } = usePost(slug);
  const { posts: allPosts } = usePosts();
  
  // Readability state
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('lg');
  const [lineSpacing, setLineSpacing] = useState<'normal' | 'relaxed' | 'loose'>('relaxed');
  const [showControls, setShowControls] = useState(false);
  const [activeId, setActiveId] = useState<string>('');

  const toc = useMemo(() => {
    if (!fbPost?.content) return [];
    const slugger = new GithubSlugger();
    const regex = /^(#{2})\s+(.+)$/gm;
    const headings = [];
    let match;
    while ((match = regex.exec(fbPost.content)) !== null) {
      const text = match[2].replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1').replace(/[*_~`]/g, '').trim();
      const id = slugger.slug(text);
      headings.push({
        level: match[1].length,
        text,
        id
      });
    }
    return headings;
  }, [fbPost?.content]);

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

  
  const post = fbPost;

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
    .slice(0, 2);

  const articleSchema = generateArticleSchema(post);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Blog', item: '/blog' },
    { name: post.title, item: `/blog/${post.slug}` }
  ]);

  return (
    <>
      <SEO 
        title={post.title}
        description={post.excerpt}
        type="article"
        url={`https://tech-nova-iota.vercel.app/blog/${post.slug}`}
        image={post.coverImage}
        author={post.author.name}
        publishedTime={post.date}
        schema={[articleSchema, breadcrumbSchema]}
      />

      <article className="bg-background max-w-none" itemScope itemType="https://schema.org/BlogPosting">
        {/* Post Header */}
        <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 max-w-4xl">
          <Link to="/blog" className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 mb-8 transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to blog
          </Link>
          
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
                <div className="font-semibold text-foreground" itemProp="name">{post.author?.name || 'TechNova Team'}</div>
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
                <span>{post.readingTime}</span>
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
              <Accordion type="single" collapsible className="w-full">
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
                <Button variant="outline" size="icon" className="rounded-full">
                  <Twitter className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full">
                  <Linkedin className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full">
                  <LinkIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="bg-background py-16 border-t border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
            <h2 className="text-2xl font-bold text-foreground mb-8">Related Articles</h2>
            <div className="grid sm:grid-cols-2 gap-8">
              {relatedPosts.map(related => (
                <Link key={related.id} to={`/blog/${related.slug}`} className="group block bg-card rounded-xl border border-border overflow-hidden hover:border-primary transition-colors">
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={related.coverImage || `https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800&auto=format&fit=crop`} 
                      alt={related.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
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
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
