import { useState, useMemo, useEffect } from 'react';
import { SEO } from '../components/SEO';
import { POSTS as STATIC_POSTS, CATEGORIES } from '../data/posts';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '../components/ui/pagination';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { calculateReadingTime } from '../lib/utils';
import { Input } from '../components/ui/input';
import { Search, Calendar, Clock, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { generateBreadcrumbSchema, generateBlogIndexGraphSchema, BASE_URL } from '../lib/seo';
import { usePosts } from '../hooks/usePosts';
import Fuse from 'fuse.js';
import Highlighter from 'react-highlight-words';

export default function Blog() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const searchQuery = searchParams.get('q') || '';
  const selectedCategory = searchParams.get('category') || null;
  const currentPageParams = searchParams.get('page');
  const currentPage = currentPageParams ? parseInt(currentPageParams, 10) : 1;
  const [semanticResults, setSemanticResults] = useState<{id: string, score: number}[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  
  const { posts: fbPosts, loading } = usePosts();
  
  const POSTS_PER_PAGE = 10;

  const posts = fbPosts.filter(p => !p.status || p.status === 'published');

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSemanticResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch('/api/semantic-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ q: searchQuery })
        });
        if (res.ok) {
          const data = await res.json();
          setSemanticResults(data.results || []);
        } else {
          setSemanticResults(null);
        }
      } catch (e) {
        console.error('Semantic search failed', e);
        setSemanticResults(null);
      } finally {
        setIsSearching(false);
      }
    }, 500); // debounce 500ms

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredPosts = useMemo(() => {
    let result = posts;

    // First filter by category if selected
    if (selectedCategory) {
      result = result.filter(post => post.category === selectedCategory);
    }

    // Apply semantic search results if available
    if (searchQuery.trim()) {
      if (semanticResults !== null) {
        // Semantic search results exist
        const resultIds = semanticResults.map(r => r.id);
        result = result.filter(post => resultIds.includes(post.id));
        // Sort by semantic score
        result.sort((a, b) => {
          const scoreA = semanticResults.find(r => r.id === a.id)?.score || 0;
          const scoreB = semanticResults.find(r => r.id === b.id)?.score || 0;
          return scoreB - scoreA;
        });
      } else {
        // Fallback to fuzzy search while loading or on error
        const fuse = new Fuse(result, {
          keys: ['title', 'excerpt'],
          threshold: 0.4,
          includeMatches: true,
        });
        result = fuse.search(searchQuery).map(res => res.item);
      }
    }

    return result;
  }, [posts, searchQuery, selectedCategory, semanticResults]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));
  const safeCurrentPage = Math.max(1, Math.min(currentPage, totalPages));

  const paginatedPosts = filteredPosts.slice(
    (safeCurrentPage - 1) * POSTS_PER_PAGE,
    safeCurrentPage * POSTS_PER_PAGE
  );

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

      <div className="bg-background border-b border-border text-foreground py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Blog</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Deep dives, tutorials, and insights into the ever-evolving world of technology.
          </p>
          
          <div className="relative max-w-xl mx-auto">
            {isSearching ? (
              <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5 animate-spin" />
            ) : (
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
            )}
            <Input 
              type="text" 
              placeholder="Search semantically via AI..." 
              className="pl-10 h-12 bg-card border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
              value={searchQuery}
              onChange={(e) => updateParams({ q: e.target.value || null })}
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Loading expert articles...</p>
          </div>
        ) : (
          <>
            {/* Category Filter */}
        <div className="flex flex-wrap items-center gap-2 mb-12 pb-6 border-b border-border">
          <span className="text-sm font-medium text-muted-foreground mr-2">Filter by:</span>
          <Badge 
            variant={selectedCategory === null ? 'default' : 'outline'}
            className="cursor-pointer hover:bg-secondary hover:text-foreground transition-colors"
            onClick={() => updateParams({ category: null })}
          >
            All
          </Badge>
          {CATEGORIES.map(category => (
            <Badge 
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              className="cursor-pointer hover:bg-secondary hover:text-foreground transition-colors"
              onClick={() => updateParams({ category })}
            >
              {category}
            </Badge>
          ))}
        </div>

        {/* Posts Grid */}
        {filteredPosts.length > 0 ? (
          <div className="space-y-12">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginatedPosts.map(post => (
              <Card key={post.id} as="article" className="overflow-hidden flex flex-col h-full hover:border-primary transition-colors bg-card border-border">
                <Link to={`/blog/${post.slug}`} className="block aspect-[16/10] overflow-hidden" aria-label={`Read article: ${post.title}`}>
                  <img 
                    src={post.coverImage || `https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800&auto=format&fit=crop`} 
                    alt={post.title} 
                    width={800}
                    height={450}
                    className="block aspect-[16/10] w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                </Link>
                <CardHeader className="p-6 pb-0 flex-grow" as="header">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary">{post.category}</Badge>
                    {post.tags?.slice(0, 2).map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs font-normal">#{tag}</Badge>
                    ))}
                    {(post.tags?.length || 0) > 2 && (
                      <Badge variant="outline" className="text-xs font-normal">+{post.tags!.length - 2}</Badge>
                    )}
                  </div>
                  <Link to={`/blog/${post.slug}`}>
                    <h2 className="text-xl font-bold text-foreground hover:text-primary transition-colors line-clamp-2 mb-3">
                      <Highlighter
                        searchWords={searchQuery.trim().split(/\s+/)}
                        autoEscape={true}
                        textToHighlight={post.title || ''}
                        highlightClassName="bg-primary/20 text-primary font-bold px-1 rounded-sm"
                      />
                    </h2>
                  </Link>
                  <p className="text-muted-foreground text-sm line-clamp-3">
                    <Highlighter
                      searchWords={searchQuery.trim().split(/\s+/)}
                      autoEscape={true}
                      textToHighlight={post.excerpt || ''}
                      highlightClassName="bg-primary/20 text-primary font-medium px-1 rounded-sm"
                    />
                  </p>
                </CardHeader>
                <CardFooter className="p-6 pt-6 text-sm text-muted-foreground flex items-center justify-between border-t border-border mt-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{format(parseISO(post.date), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{calculateReadingTime(post.content)}</span>
                  </div>
                </CardFooter>
              </Card>
            ))}
            </div>

            {totalPages > 1 && (
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t border-border pt-8 mt-12 mb-8">
                <div className="text-sm text-muted-foreground whitespace-nowrap">
                  Showing <span className="font-medium text-foreground">{((safeCurrentPage - 1) * POSTS_PER_PAGE) + 1}</span> to <span className="font-medium text-foreground">{Math.min(safeCurrentPage * POSTS_PER_PAGE, filteredPosts.length)}</span> of <span className="font-medium text-foreground">{filteredPosts.length}</span> results
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
                     className="w-16 h-8 text-center bg-card border-border px-1"
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
            <h3 className="text-2xl font-semibold text-foreground mb-2">No articles found</h3>
            <p className="text-muted-foreground">Try adjusting your search or category filter.</p>
          </div>
        )}
          </>
        )}
      </div>
    </>
  );
}
