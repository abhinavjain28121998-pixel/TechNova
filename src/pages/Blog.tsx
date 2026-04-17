import { useState } from 'react';
import { SEO } from '../components/SEO';
import { POSTS as STATIC_POSTS, CATEGORIES } from '../data/posts';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Search, Calendar, Clock, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { generateBreadcrumbSchema } from '../lib/seo';
import { usePosts } from '../hooks/usePosts';

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { posts: fbPosts, loading } = usePosts();

  const posts = (fbPosts.length > 0 ? fbPosts : STATIC_POSTS).filter(p => !p.status || p.status === 'published');

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? post.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Blog', item: '/blog' }
  ]);

  return (
    <>
      <SEO 
        title="Blog Post Archive & Tech Tutorials | TechNova"
        description="Browse all our technology articles, tutorials, and insights."
        url="https://tech-nova-iota.vercel.app/blog"
        schema={breadcrumbSchema}
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map(post => (
              <Card key={post.id} className="overflow-hidden flex flex-col h-full hover:border-primary transition-colors bg-card border-border">
                <Link to={`/blog/${post.slug}`} className="block aspect-[16/10] overflow-hidden">
                  <img 
                    src={post.coverImage} 
                    alt={post.title} 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                </Link>
                <CardHeader className="p-6 pb-0 flex-grow">
                  <Badge variant="secondary" className="w-fit mb-4">{post.category}</Badge>
                  <Link to={`/blog/${post.slug}`}>
                    <h3 className="text-xl font-bold text-foreground hover:text-primary transition-colors line-clamp-2 mb-3">
                      {post.title}
                    </h3>
                  </Link>
                  <p className="text-muted-foreground text-sm line-clamp-3">
                    {post.excerpt}
                  </p>
                </CardHeader>
                <CardFooter className="p-6 pt-6 text-sm text-muted-foreground flex items-center justify-between border-t border-border mt-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{format(parseISO(post.date), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{post.readingTime}</span>
                  </div>
                </CardFooter>
              </Card>
            ))}
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
