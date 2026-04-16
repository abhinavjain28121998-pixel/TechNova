import { SEO } from '../components/SEO';
import { POSTS, CATEGORIES } from '../data/posts';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button, buttonVariants } from '../components/ui/button';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function Home() {
  const featuredPost = POSTS.find(post => post.featured) || POSTS[0];
  const recentPosts = POSTS.filter(post => post.id !== featuredPost.id).slice(0, 3);
  const trendingPosts = POSTS.filter(post => post.trending).slice(0, 4);

  return (
    <>
      <SEO 
        title="TechNova Blog | Modern Technology Insights"
        description="Discover the latest trends in AI, Web Development, Cybersecurity, and more. Expert insights for the modern technologist."
      />

      {/* Hero Section */}
      <section className="bg-background border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-3xl">
            <Badge className="mb-6 bg-primary/20 text-primary hover:bg-primary/30 border-none">Welcome to TechNova</Badge>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground mb-6 leading-tight">
              Decoding the Future of <br className="hidden md:block" /><span className="text-primary">Technology</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl">
              Expert analysis, tutorials, and insights on AI, web development, and the software shaping our world.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/blog" className={buttonVariants({ size: 'lg' })}>
                Read Latest Posts
              </Link>
              <Link to="/categories" className={buttonVariants({ size: 'lg', variant: 'outline' })}>
                Explore Categories
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-16 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Featured Story</h2>
        </div>
        <Link to={`/blog/${featuredPost.slug}`} className="group block">
          <div className="grid md:grid-cols-2 gap-8 items-center bg-card rounded-2xl overflow-hidden border border-border shadow-sm transition-all hover:border-primary">
            <div className="aspect-video md:aspect-auto md:h-full relative overflow-hidden">
              <img 
                src={featuredPost.coverImage} 
                alt={featuredPost.title}
                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-8 md:p-12">
              <Badge className="mb-4">{featuredPost.category}</Badge>
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                {featuredPost.title}
              </h3>
              <p className="text-muted-foreground mb-6 line-clamp-3">
                {featuredPost.excerpt}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <img src={featuredPost.author.avatar} alt={featuredPost.author.name} className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
                  <span className="font-medium text-foreground">{featuredPost.author.name}</span>
                </div>
                <span className="hidden sm:inline">•</span>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{format(parseISO(featuredPost.date), 'MMM d, yyyy')}</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </section>

      {/* Latest & Trending Grid */}
      <section className="py-16 bg-background border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            
            {/* Latest Posts */}
            <div className="lg:col-span-2">
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">Latest Articles</h2>
                <Link to="/blog" className="text-primary font-medium hover:underline flex items-center gap-1">
                  View all <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                {recentPosts.map(post => (
                  <Card key={post.id} className="overflow-hidden flex flex-col h-full hover:border-primary transition-colors bg-card border-border">
                    <Link to={`/blog/${post.slug}`} className="block aspect-video overflow-hidden">
                      <img 
                        src={post.coverImage} 
                        alt={post.title} 
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                    </Link>
                    <CardHeader className="p-5 pb-0 flex-grow">
                      <Badge variant="secondary" className="w-fit mb-3">{post.category}</Badge>
                      <Link to={`/blog/${post.slug}`}>
                        <h3 className="text-xl font-bold text-foreground hover:text-primary transition-colors line-clamp-2 mb-2">
                          {post.title}
                        </h3>
                      </Link>
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {post.excerpt}
                      </p>
                    </CardHeader>
                    <CardFooter className="p-5 pt-4 text-sm text-muted-foreground flex items-center justify-between border-t border-border mt-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{format(parseISO(post.date), 'MMM d')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{post.readingTime}</span>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-12">
              {/* Trending */}
              <div>
                <h2 className="text-xl font-bold text-foreground mb-6 pb-2 border-b border-border">Trending Now</h2>
                <div className="space-y-6">
                  {trendingPosts.map((post, index) => (
                    <Link key={post.id} to={`/blog/${post.slug}`} className="group flex gap-4 items-start">
                      <span className="text-3xl font-bold text-muted-foreground/30 group-hover:text-primary/50 transition-colors">
                        0{index + 1}
                      </span>
                      <div>
                        <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1">
                          {post.title}
                        </h4>
                        <span className="text-xs text-muted-foreground">{format(parseISO(post.date), 'MMM d, yyyy')}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <h2 className="text-xl font-bold text-foreground mb-6 pb-2 border-b border-border">Popular Categories</h2>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(category => (
                    <Link key={category} to={`/categories?c=${encodeURIComponent(category)}`}>
                      <Badge variant="outline" className="hover:bg-secondary text-sm py-1.5 px-3">
                        {category}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
