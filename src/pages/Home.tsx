import { SEO } from '../components/SEO';
import { POSTS as STATIC_POSTS, CATEGORIES } from '../data/posts';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button, buttonVariants } from '../components/ui/button';
import { ArrowRight, Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { generateWebSiteSchema, generateOrganizationSchema } from '../lib/seo';
import { usePosts } from '../hooks/usePosts';
import { useState, useEffect } from 'react';

export default function Home() {
  const { posts: fbPosts, loading } = usePosts();
  
  // Use Firestore posts if available, otherwise fallback to static data
  const posts = (fbPosts.length > 0 ? fbPosts : STATIC_POSTS).filter(p => p.status === 'published' || !p.status); // fallback for posts without status
  
  const featuredPosts = posts.filter(post => post.featured);
  const carouselPosts = featuredPosts.length > 0 ? featuredPosts : posts.slice(0, 3);
  const recentPosts = posts.filter(post => !carouselPosts.find(p => p.id === post.id)).slice(0, 3);
  const trendingPosts = posts.filter(post => post.trending).slice(0, 4);

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (carouselPosts.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselPosts.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [carouselPosts.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % carouselPosts.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + carouselPosts.length) % carouselPosts.length);

  return (
    <>
      <SEO 
        title="Tech & AI Blog | Insights & Tutorials - TechNova"
        description="Discover the latest trends in AI, Web Development, Cybersecurity, and more. Expert insights for the modern technologist."
        url="https://tech-nova-iota.vercel.app/"
        schema={[generateWebSiteSchema(), generateOrganizationSchema()]}
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

      {/* Featured Posts Carousel */}
      <section className="py-16 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Featured Stories</h2>
          {carouselPosts.length > 1 && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={prevSlide} aria-label="Previous story">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextSlide} aria-label="Next story">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        <div className="relative overflow-hidden rounded-2xl border border-border shadow-sm">
          <div 
            className="flex transition-transform duration-500 ease-in-out h-full"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {carouselPosts.map((post) => (
              <div key={post.id} className="w-full flex-shrink-0">
                <Link to={`/blog/${post.slug}`} className="group block h-full">
                  <div className="grid md:grid-cols-2 h-full items-center bg-card transition-colors hover:bg-card/80">
                    <div className="aspect-video md:aspect-auto md:h-full relative overflow-hidden">
                      <img 
                        src={post.coverImage} 
                        alt={post.title}
                        className="object-cover w-full h-full min-h-[300px] transition-transform duration-700 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="p-8 md:p-12">
                      <Badge className="mb-4">{post.category}</Badge>
                      <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground mb-6 line-clamp-3">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <img src={post.author.avatar} alt={post.author.name} className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
                          <span className="font-medium text-foreground">{post.author.name}</span>
                        </div>
                        <span className="hidden sm:inline">•</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{format(parseISO(post.date), 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
          
          {/* Dot Indicators */}
          {carouselPosts.length > 1 && (
            <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {carouselPosts.map((_, idx) => (
                <button 
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2 rounded-full transition-all ${idx === currentSlide ? 'bg-primary w-6' : 'bg-primary/30 w-2 hover:bg-primary/50'}`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
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
