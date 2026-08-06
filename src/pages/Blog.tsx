import { useState, useMemo, useEffect } from 'react';
import { SEO } from '../components/SEO';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '../components/ui/pagination';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { calculateReadingTime, getOptimizedImageUrl } from '../lib/utils';
import { Input } from '../components/ui/input';
import { SearchBar } from '../components/SearchBar';
import { Calendar, Clock, Loader2, Search } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { generateBreadcrumbSchema, generateBlogIndexGraphSchema, BASE_URL } from '../lib/seo';
import { usePosts } from '../hooks/usePosts';
import { getPosts } from '../lib/postService';
import { Post } from '../types';
import { Breadcrumbs } from '../components/Breadcrumbs';

function HighlightText({ text, search, highlightClassName }: { text: string; search: string; highlightClassName?: string }) {
  if (!search.trim()) {
    return <span>{text}</span>;
  }
  const words = search.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return <span>{text}</span>;
  }
  const escapedWords = words.map(w => w.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
  const regex = new RegExp(`(${escapedWords.join('|')})`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, i) => {
        const isMatch = words.some(w => part.toLowerCase() === w.toLowerCase());
        return isMatch ? (
          <span key={i} className={highlightClassName}>
            {part}
          </span>
        ) : (
          part
        );
      })}
    </span>
  );
}

let cachedAllPosts: Post[] | null = null;

export default function Blog() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const selectedCategory = searchParams.get('category') || null;
  const currentPageParams = searchParams.get('page');
  const safeCurrentPage = currentPageParams ? parseInt(currentPageParams, 10) : 1;
  const [semanticResults, setSemanticResults] = useState<{id: string, score: number}[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchParams.get('q') || '');
  const searchQuery = searchParams.get('q') || '';
  
  const POSTS_PER_PAGE = 10;

  useEffect(() => {
    setLocalSearchQuery(searchParams.get('q') || '');
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearchQuery !== (searchParams.get('q') || '')) {
        updateParams({ q: localSearchQuery || null });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearchQuery]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSemanticResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        if (!cachedAllPosts) {
          cachedAllPosts = await getPosts();
        }
        const Fuse = (await import('fuse.js')).default;
        const fuse = new Fuse(cachedAllPosts, {
          keys: ['title', 'tags', 'excerpt'],
          threshold: 0.3,
          ignoreLocation: true,
        });
        const results = fuse.search(searchQuery).map(res => ({ 
          id: (res.item.slug || res.item.id) as string, 
          score: 1 
        }));
        setSemanticResults(results);
      } catch (e) {
        console.error('Search failed', e);
        setSemanticResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300); // debounce 300ms

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const postIdsToFetch = useMemo(() => {
    if (!searchQuery.trim()) return null;
    if (semanticResults === null) return []; // Meaning search is still initializing/in-flight, return empty or something indicating loading. Wait, returning empty might make usePosts return []. Let's just return [] for now so it loads nothing while searching.
    return semanticResults.map(r => r.id);
  }, [searchQuery, semanticResults]);

  const { posts: paginatedPosts, totalPosts, loading } = usePosts(
    safeCurrentPage,
    POSTS_PER_PAGE,
    selectedCategory,
    postIdsToFetch
  );

  const totalPages = Math.max(1, Math.ceil(totalPosts / POSTS_PER_PAGE));

  const getPageUrl = (pageNum: number) => {
    const params = new URLSearchParams(searchParams);
    if (pageNum > 1) {
      params.set('page', pageNum.toString());
    } else {
      params.delete('page');
    }
    return `?${params.toString()}`;
  };

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    // Reset to page 1 for filter changes unless page is explicitly updated
    if (!('page' in updates)) {
      params.delete('page');
    }
    setSearchParams(params, { replace: true });
  };

  const blogIndexSchema = generateBlogIndexGraphSchema(paginatedPosts, safeCurrentPage, selectedCategory);

  return (
    <>
      <SEO 
        title="TechNova Blog | AI & Software Engineering Articles"
        description="Read our latest articles on Artificial Intelligence, Web Development, and Cybersecurity. Actionable tutorials and insights for tech professionals."
        keywords={['tech blog', 'tech tutorials', 'software development', 'programming articles']}
        schema={blogIndexSchema}
        url={`${BASE_URL}/blog`}
      />

      <div className="bg-background border-b border-border/40 text-foreground py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <div className="mb-6 flex justify-center">
            <Breadcrumbs 
              items={[
                { label: 'Home', href: '/' },
                { label: 'Blog', href: '/blog' }
              ]} 
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">Our Blog</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Deep dives, tutorials, and insights into the ever-evolving world of technology.
          </p>
          
          <SearchBar 
            value={localSearchQuery}
            onChange={setLocalSearchQuery}
            isSearching={isSearching}
            placeholder="Search articles by title or keywords..."
            className="max-w-xl mx-auto"
          />
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="space-y-12 animate-pulse">
            <div className="flex flex-wrap items-center gap-2 mb-12 pb-6 border-b border-border/40">
              <div className="h-5 w-16 bg-muted rounded mr-2"></div>
              <div className="h-6 w-12 bg-muted rounded border border-border/40"></div>
              <div className="h-6 w-24 bg-muted rounded border border-border/40"></div>
              <div className="h-6 w-20 bg-muted rounded border border-border/40"></div>
              <div className="h-6 w-28 bg-muted rounded border border-border/40"></div>
              <div className="h-6 w-16 bg-muted rounded border border-border/40"></div>
            </div>

            <div className="flex flex-col gap-8">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden flex flex-col md:flex-row border-border/40">
                  <div className="w-full md:w-1/3 aspect-[16/10] md:aspect-auto bg-muted shrink-0"></div>
                  <div className="flex flex-col flex-grow p-6">
                    <header className="mb-4">
                      <div className="flex flex-wrap gap-2 mb-3">
                        <div className="h-5 w-20 bg-muted rounded"></div>
                        <div className="h-5 w-16 bg-muted rounded"></div>
                      </div>
                      <div className="h-8 w-3/4 bg-muted rounded mb-2"></div>
                      <div className="h-8 w-1/2 bg-muted rounded mb-3"></div>
                    </header>
                    <div className="space-y-2 mb-6 flex-grow">
                      <div className="h-4 w-full bg-muted rounded"></div>
                      <div className="h-4 w-full bg-muted rounded"></div>
                      <div className="h-4 w-2/3 bg-muted rounded"></div>
                    </div>
                    <footer className="flex items-center justify-between border-t border-border/40 pt-4 mt-auto">
                      <div className="h-4 w-24 bg-muted rounded"></div>
                      <div className="h-4 w-24 bg-muted rounded"></div>
                    </footer>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
        {/* Posts List */}
        {paginatedPosts.length > 0 ? (
          <div className="space-y-12">
            <div className="flex flex-col gap-8">
              {paginatedPosts.map((post, index) => (
              <Card key={post.slug || post.id} as="article" className="overflow-hidden flex flex-col md:flex-row hover:border-primary transition-colors bg-card border-border/40">
                <Link to={`/blog/${post.slug}`} className="block w-full md:w-1/3 aspect-[16/10] md:aspect-auto overflow-hidden shrink-0" aria-label={`Read article: ${post.title}`}>
                  <img 
                    src={getOptimizedImageUrl(post.coverImage, 600)} 
                    alt={post.title} 
                    width={600}
                    height={375}
                    className="block w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    referrerPolicy="no-referrer"
                    loading={index < 2 ? "eager" : "lazy"}
                    onError={(e) => {
                      const img = e.currentTarget;
                      if (!img.src.includes('expert-outlook-navigating-artificial-intelligence-in-2026.png')) {
                        img.src = '/banners/expert-outlook-navigating-artificial-intelligence-in-2026.png';
                      }
                    }}
                  />
                </Link>
                <div className="flex flex-col flex-grow p-6">
                  <header className="mb-4">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="secondary">{post.category}</Badge>
                      {post.tags?.slice(0, 2).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs font-normal">#{tag}</Badge>
                      ))}
                      {(post.tags?.length || 0) > 2 && (
                        <Badge variant="outline" className="text-xs font-normal">+{post.tags!.length - 2}</Badge>
                      )}
                    </div>
                    <Link to={`/blog/${post.slug}`}>
                      <h2 className="text-2xl font-bold text-foreground hover:text-primary transition-colors line-clamp-2 mb-3">
                        <HighlightText
                          text={post.title || ''}
                          search={searchQuery}
                          highlightClassName="bg-primary/20 text-primary font-bold px-1 rounded-sm"
                        />
                      </h2>
                    </Link>
                  </header>
                  <p className="text-muted-foreground text-sm line-clamp-3 mb-6 flex-grow">
                    <HighlightText
                      text={post.excerpt || ''}
                      search={searchQuery}
                      highlightClassName="bg-primary/20 text-primary font-medium px-1 rounded-sm"
                    />
                  </p>
                  <footer className="text-sm text-muted-foreground flex items-center justify-between border-t border-border/40 pt-4 mt-auto">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{format(parseISO(post.date), 'MMM d, yyyy')}</span>
                    </div>
                    <Badge variant="secondary" className="flex items-center gap-1 font-normal text-muted-foreground bg-secondary/50 rounded-md">
                      <Clock className="w-3 h-3" />
                      {calculateReadingTime(post.content)}
                    </Badge>
                  </footer>
                </div>
              </Card>
            ))}
            </div>

            {totalPages > 1 && (
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t border-border/40 pt-8 mt-12 mb-8">
                <div className="text-sm text-muted-foreground whitespace-nowrap">
                  Showing <span className="font-medium text-foreground">{((safeCurrentPage - 1) * POSTS_PER_PAGE) + 1}</span> to <span className="font-medium text-foreground">{Math.min(safeCurrentPage * POSTS_PER_PAGE, totalPosts)}</span> of <span className="font-medium text-foreground">{totalPosts}</span> results
                </div>

                <Pagination className="mx-0 w-auto">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        href={getPageUrl(Math.max(1, safeCurrentPage - 1))}
                        onClick={(e) => { e.preventDefault(); updateParams({ page: Math.max(1, safeCurrentPage - 1).toString() }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className={safeCurrentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const pageNum = i + 1;
                      if (
                        pageNum === 1 || 
                        pageNum === totalPages || 
                        (pageNum >= safeCurrentPage - 1 && pageNum <= safeCurrentPage + 1)
                      ) {
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink 
                              href={getPageUrl(pageNum)}
                              isActive={safeCurrentPage === pageNum}
                              onClick={(e) => { e.preventDefault(); updateParams({ page: pageNum.toString() }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      } else if (
                        pageNum === safeCurrentPage - 2 || 
                        pageNum === safeCurrentPage + 2
                      ) {
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }
                      return null;
                    })}

                    <PaginationItem>
                      <PaginationNext 
                        href={getPageUrl(Math.min(totalPages, safeCurrentPage + 1))}
                        onClick={(e) => { e.preventDefault(); updateParams({ page: Math.min(totalPages, safeCurrentPage + 1).toString() }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className={safeCurrentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap">
                   <label htmlFor="jump-to-page">Go to page:</label>
                   <Input 
                     id="jump-to-page"
                     key={safeCurrentPage}
                     type="number" 
                     min={1} 
                     max={totalPages} 
                     className="w-16 h-8 text-center bg-card border-border/40 px-1"
                     defaultValue={safeCurrentPage}
                     onKeyDown={(e) => {
                       if (e.key === 'Enter') {
                         const val = parseInt(e.currentTarget.value, 10);
                         if (!isNaN(val) && val >= 1 && val <= totalPages) {
                            updateParams({ page: val.toString() });
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                         }
                       }
                     }}
                     onBlur={(e) => {
                       const val = parseInt(e.target.value, 10);
                       if (!isNaN(val) && val >= 1 && val <= totalPages && val !== safeCurrentPage) {
                          updateParams({ page: val.toString() });
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                       } else {
                          e.target.value = safeCurrentPage.toString();
                       }
                     }}
                   />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-24">
            <h2 className="text-2xl font-semibold text-foreground mb-2">No articles found</h2>
            <p className="text-muted-foreground">Try adjusting your search or category filter.</p>
          </div>
        )}
          </>
        )}
      </div>
    </>
  );
}
