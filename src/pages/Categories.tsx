import { SEO } from '../components/SEO';
import { CATEGORIES, POSTS } from '../data/posts';
import { Link, useSearchParams } from 'react-router-dom';
import { Badge } from '../components/ui/badge';
import { Card, CardHeader, CardFooter } from '../components/ui/card';
import { calculateReadingTime } from '../lib/utils';
import { Calendar, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { generateBreadcrumbSchema, BASE_URL } from '../lib/seo';

export default function Categories() {
  const [searchParams] = useSearchParams();
  const activeCategory = searchParams.get('c');

  const displayCategory = activeCategory && CATEGORIES.includes(activeCategory) 
    ? activeCategory 
    : null;

  const filteredPosts = displayCategory 
    ? POSTS.filter(post => post.category === displayCategory)
    : POSTS;

  const breadcrumbItems = [
    { name: 'Home', item: '/' },
    { name: 'Categories', item: '/categories' }
  ];
  
  if (displayCategory) {
    breadcrumbItems.push({ name: displayCategory, item: `/categories?c=${encodeURIComponent(displayCategory)}` });
  }

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);

  return (
    <>
      <SEO 
        title={displayCategory ? `${displayCategory} Articles | TechNova` : "All Categories | TechNova"}
        description={displayCategory ? `Browse TechNova articles related to ${displayCategory}.` : "Browse TechNova articles by category."}
        keywords={['tech categories', 'tech topics', displayCategory || '']}
        schema={[breadcrumbSchema]}
        url={`${BASE_URL}/categories${displayCategory ? `?c=${encodeURIComponent(displayCategory)}` : ''}`}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-5xl">
        <h1 className="text-4xl font-bold text-foreground mb-8">Categories</h1>
        
        <div className="flex flex-wrap gap-3 mb-12">
          <Link to="/categories">
            <Badge 
              variant={!displayCategory ? 'default' : 'outline'}
              className="text-base py-2 px-4 hover:bg-secondary hover:text-foreground transition-colors"
            >
              All Topics
            </Badge>
          </Link>
          {CATEGORIES.map(category => (
            <Link key={category} to={`/categories?c=${encodeURIComponent(category)}`}>
              <Badge 
                variant={displayCategory === category ? 'default' : 'outline'}
                className="text-base py-2 px-4 hover:bg-secondary hover:text-foreground transition-colors"
              >
                {category}
                <span className="ml-2 opacity-60 text-xs">
                  {POSTS.filter(p => p.category === category).length}
                </span>
              </Badge>
            </Link>
          ))}
        </div>

        <div className="mb-8 border-b border-border pb-4">
          <h2 className="text-2xl font-semibold text-foreground">
            {displayCategory ? `Articles in "${displayCategory}"` : 'All Articles'}
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-8">
          {filteredPosts.map(post => (
            <Card key={post.id} as="article" className="overflow-hidden flex flex-col h-full hover:border-primary transition-colors bg-card border-border">
              <Link to={`/blog/${post.slug}`} className="block aspect-[16/9] overflow-hidden" aria-label={`Read article: ${post.title}`}>
                <img 
                  src={post.coverImage} 
                  alt={post.title} 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              </Link>
              <CardHeader className="p-6 pb-0 flex-grow" as="header">
                <Badge variant="secondary" className="w-fit mb-4">{post.category}</Badge>
                <Link to={`/blog/${post.slug}`}>
                  <h3 className="text-xl font-bold text-foreground hover:text-primary transition-colors line-clamp-2 mb-3">
                    {post.title}
                  </h3>
                </Link>
              </CardHeader>
              <CardFooter className="p-6 pt-4 text-sm text-muted-foreground flex items-center justify-between border-t border-border mt-4">
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
      </div>
    </>
  );
}
