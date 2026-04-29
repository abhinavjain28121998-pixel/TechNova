import { useState, useMemo, useEffect } from 'react';
import { SEO } from '../components/SEO';
import { POSTS as STATIC_POSTS, CATEGORIES } from '../data/posts';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '../components/ui/pagination';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { calculateReadingTime } from '../lib/utils';
import { Input } from '../components/ui/input';
import { Search, Calendar, Clock, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { generateBreadcrumbSchema } from '../lib/seo';
import { usePosts } from '../hooks/usePosts';
import Fuse from 'fuse.js';
import Highlighter from 'react-highlight-words';

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { posts: fbPosts, loading } = usePosts();
  
  const POSTS_PER_PAGE = 10;

  const posts = fbPosts.filter(p => !p.status || p.status === 'published');

  const filteredPosts = useMemo(() => {
    let result = posts;

    // First filter by category if selected
    if (selectedCategory) {
      result = result.filter(post => post.category === selectedCategory);
    }

    // Then fuzzy search if there's a query
    if (searchQuery.trim()) {
      const fuse = new Fuse(result, {
        keys: ['title', 'excerpt'],
        threshold: 0.4,
        includeMatches: true,
      });
      result = fuse.search(searchQuery).map(res => res.item);
    }

    return result;
  }, [posts, searchQuery, selectedCategory]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedPosts = filteredPosts.slice(
    (safeCurrentPage - 1) * POSTS_PER_PAGE,
    safeCurrentPage * POSTS_PER_PAGE
  );

  const handlePageChange = (pageNum: number) => {
    setCurrentPage(pageNum);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Blog', item: '/blog' }
  ]);

  return (
    <>
      <SEO 
        title="Blog Post Archive & Tech Tutorials | TechNova"
        description="Browse all our technology articles, tutorials, and insights."
        keywords={['tech blog', 'tech tutorials', 'software development', 'programming articles']}
        schema={[breadcrumbSchema]}
        url="https://tech-nova-iota.vercel.app/blog"
      />

      <div className="bg-background border-b border-border text-foreground py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Blog</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Deep dives, tutorials, and insights into the ever-evolving world of technology.
          </p>
          
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input 
              type="text" 
              placeholder="Search articles..." 
              className="pl-10 h-12 bg-card border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Filter */}
        <div className="flex flex-wrap items-center gap-2 mb-12 pb-6 border-b border-border">
          <span className="text-sm font-medium text-muted-foreground mr-2">Filter by:</span>
          <Badge 
            variant={selectedCategory === null ? 'default' : 'outline'}
            className="cursor-pointer hover:bg-secondary hover:text-foreground transition-colors"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Badge>
          {CATEGORIES.map(category => (
            <Badge 
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              className="cursor-pointer hover:bg-secondary hover:text-foreground transition-colors"
              onClick={() => setSelectedCategory(category)}
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
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
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
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); handlePageChange(Math.max(1, safeCurrentPage - 1)); }}
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
                            href="#" 
                            isActive={safeCurrentPage === pageNum}
                            onClick={(e) => { e.preventDefault(); handlePageChange(pageNum); }}
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
                      href="#" 
                      onClick={(e) => { e.preventDefault(); handlePageChange(Math.min(totalPages, safeCurrentPage + 1)); }}
                      className={safeCurrentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        ) : (
          <div className="text-center py-24">
            <h3 className="text-2xl font-semibold text-foreground mb-2">No articles found</h3>
            <p className="text-muted-foreground">Try adjusting your search or category filter.</p>
          </div>
        )}
      </div>
    </>
  );
}
