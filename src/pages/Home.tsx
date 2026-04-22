import { SEO } from '../components/SEO';
import { POSTS as STATIC_POSTS, CATEGORIES } from '../data/posts';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { calculateReadingTime } from '../lib/utils';
import { Button, buttonVariants } from '../components/ui/button';
import { ArrowRight, Calendar, Clock, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { generateWebSiteSchema, generateOrganizationSchema } from '../lib/seo';
import { usePosts } from '../hooks/usePosts';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

export default function Home() {
  const { posts: fbPosts, loading } = usePosts();
  
  // Use strictly Firestore posts so it doesn't accidentally revert to static posts when empty
  const posts = fbPosts.filter(p => p.status === 'published' || !p.status);
  
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
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column: Text Content */}
            <div className="max-w-3xl">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <Badge className="mb-6 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 px-4 py-1.5 flex w-fit items-center gap-2 rounded-full backdrop-blur-sm">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  <span className="font-semibold tracking-wide uppercase text-xs">Welcome to TechNova</span>
                </Badge>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground mb-6 leading-[1.1] pb-2"
              >
                Decoding the <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-500 to-purple-600 animate-gradient bg-[length:200%_auto]">Future of Tech</span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="text-xl md:text-2xl text-muted-foreground mb-10 leading-relaxed max-w-xl"
              >
                Expert analysis, tutorials, and deep-dive insights on Artificial Intelligence, advanced Web Development, and the Software shaping tomorrow.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col sm:flex-row gap-4 items-start"
              >
                <Link to="/blog" className="group w-full sm:w-auto">
                  <div className={buttonVariants({ size: 'lg', className: 'w-full relative overflow-hidden transition-all hover:shadow-[0_0_30px_rgba(var(--primary),0.4)] hover:scale-105 duration-300' })}>
                    <span className="relative z-10 flex items-center gap-2 font-semibold">
                      Explore Latest Posts
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
                    </span>
                    <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/25 to-transparent z-0" />
                  </div>
                </Link>
                <Link to="/categories" className={buttonVariants({ size: 'lg', variant: 'outline', className: 'w-full sm:w-auto hover:bg-primary/5 hover:text-primary border-primary/20 hover:border-primary/50 transition-all duration-300' })}>
                  Browse Categories
                </Link>
              </motion.div>
            </div>

            {/* Right Column: Floating Tech Graphics */}
            <div className="hidden lg:block relative h-[600px] w-full perspective-[2000px]">
              {/* Primary Floating Image */}
              <motion.div
                animate={{ 
                  y: [-10, 10, -10],
                  rotateY: [-5, 5, -5],
                  rotateX: [2, -2, 2]
                }}
                transition={{ 
                  duration: 6, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[500px] z-20 hover:z-30 transition-all duration-500 hover:scale-105"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black/50 backdrop-blur-sm p-2">
                  <img src="https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1200&auto=format&fit=crop" alt="Artificial Intelligence Neural Network" className="rounded-xl object-cover aspect-video w-full" referrerPolicy="no-referrer" />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge variant="secondary" className="bg-black/80 text-primary border-primary/20 backdrop-blur-md">AI Model</Badge>
                  </div>
                </div>
              </motion.div>

              {/* Secondary Floating Image - Top Right */}
              <motion.div
                animate={{ 
                  y: [15, -15, 15],
                  x: [5, -5, 5]
                }}
                transition={{ 
                  duration: 7, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: 1 
                }}
                className="absolute top-10 right-0 w-[240px] z-10 opacity-80 hover:opacity-100 hover:z-30 transition-all duration-500"
              >
                <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black/50 backdrop-blur-sm p-1.5 transform rotate-3 hover:rotate-0 transition-transform">
                  <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop" alt="Web Development Code" className="rounded-xl object-cover aspect-video w-full" referrerPolicy="no-referrer" />
                </div>
              </motion.div>

              {/* Tertiary Floating Image - Bottom Left */}
              <motion.div
                animate={{ 
                  y: [-20, 20, -20],
                  rotateZ: [-2, 2, -2]
                }}
                transition={{ 
                  duration: 8, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: 2 
                }}
                className="absolute bottom-10 left-0 w-[280px] z-30 opacity-90 hover:opacity-100 transition-all duration-500"
              >
                <div className="rounded-2xl overflow-hidden shadow-2xl shadow-primary/20 border border-primary/20 bg-background/80 backdrop-blur-xl p-4 transform -rotate-6 hover:rotate-0 transition-transform flex items-center gap-4">
                  <div className="bg-primary/20 p-3 rounded-full">
                    <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Zero Trust Security</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Enterprise Architecture</p>
                  </div>
                </div>
              </motion.div>
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
                        src={post.coverImage || `https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1200&auto=format&fit=crop`} 
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
                          <img src={post.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author?.name || 'User'}`} alt={post.author?.name || 'Author'} className="w-8 h-8 rounded-full bg-slate-800" referrerPolicy="no-referrer" />
                          <span className="font-medium text-foreground">{post.author?.name || 'TechNova Team'}</span>
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
                {recentPosts.map((post, i) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="h-full"
                  >
                    <Card className="overflow-hidden flex flex-col h-full hover:border-primary transition-colors bg-card border-border">
                      <Link to={`/blog/${post.slug}`} className="block aspect-video overflow-hidden">
                        <img 
                          src={post.coverImage || `https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800&auto=format&fit=crop`} 
                          alt={post.title} 
                          className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
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
                          <span>{format(parseISO(post.date), 'MMM d, yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{calculateReadingTime(post.content)}</span>
                        </div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-12">
              {/* Trending */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-xl font-bold text-foreground mb-6 pb-2 border-b border-border flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Trending Now
                </h2>
                <div className="space-y-6">
                  {trendingPosts.map((post, index) => (
                    <motion.div 
                      key={post.id}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Link to={`/blog/${post.slug}`} className="group flex gap-4 items-start">
                        <span className="text-3xl font-bold text-muted-foreground/20 group-hover:text-primary transition-colors duration-300">
                          0{index + 1}
                        </span>
                        <div>
                          <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1">
                            {post.title}
                          </h4>
                          <span className="text-xs text-muted-foreground">{format(parseISO(post.date), 'MMM d, yyyy')}</span>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Categories */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h2 className="text-xl font-bold text-foreground mb-6 pb-2 border-b border-border">Popular Categories</h2>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((category, idx) => (
                    <motion.div
                      key={category}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                    >
                      <Link to={`/categories?c=${encodeURIComponent(category)}`}>
                        <Badge variant="outline" className="hover:bg-primary/20 hover:text-primary hover:border-primary/50 transition-all duration-300 text-sm py-1.5 px-3">
                          {category}
                        </Badge>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
