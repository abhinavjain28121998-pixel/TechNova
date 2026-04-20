import { SEO } from '../components/SEO';
import { POSTS as STATIC_POSTS, CATEGORIES } from '../data/posts';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button, buttonVariants } from '../components/ui/button';
import { ArrowRight, Calendar, Clock, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { generateWebSiteSchema, generateOrganizationSchema } from '../lib/seo';
import { usePosts } from '../hooks/usePosts';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

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
      <section className="relative overflow-hidden bg-background border-b border-border">
        {/* Subtle Background Glows */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3">
          <div className="w-[600px] h-[600px] rounded-full bg-primary/20 blur-[120px] opacity-70 animate-pulse-slow mix-blend-screen pointer-events-none" />
        </div>
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3">
          <div className="w-[400px] h-[400px] rounded-full bg-blue-500/10 blur-[100px] opacity-50 mix-blend-screen pointer-events-none" />
        </div>

        {/* Optional Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <Badge className="mb-6 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 px-3 py-1 flex w-fit items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Welcome to TechNova
              </Badge>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
              className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-6 leading-[1.1]"
            >
              Decoding the Future of <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Technology</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
              className="text-xl md:text-2xl text-muted-foreground mb-10 leading-relaxed max-w-2xl"
            >
              Expert analysis, tutorials, and insights on AI, web development, and the software shaping our world.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
              className="flex flex-col sm:flex-row gap-4 items-start"
            >
              <Link to="/blog" className="group">
                <div className={buttonVariants({ size: 'lg', className: 'relative overflow-hidden transition-all hover:shadow-[0_0_20px_rgba(var(--primary),0.3)]' })}>
                  <span className="relative z-10 flex items-center gap-2">
                    Read Latest Posts
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0" />
                </div>
              </Link>
              <Link to="/categories" className={buttonVariants({ size: 'lg', variant: 'outline', className: 'hover:bg-primary/5 border-primary/20 hover:border-primary/50 transition-colors' })}>
                Explore Categories
              </Link>
            </motion.div>
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
