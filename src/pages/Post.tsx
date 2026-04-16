import { useParams, Link, Navigate } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { POSTS } from '../data/posts';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { Calendar, Clock, ChevronLeft, Twitter, Linkedin, Link as LinkIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import ReactMarkdown from 'react-markdown';

export default function Post() {
  const { slug } = useParams<{ slug: string }>();
  const post = POSTS.find(p => p.slug === slug);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const relatedPosts = POSTS
    .filter(p => p.category === post.category && p.id !== post.id)
    .slice(0, 2);

  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "image": [post.coverImage],
    "datePublished": post.date,
    "author": [{
        "@type": "Person",
        "name": post.author.name
    }]
  };

  return (
    <>
      <SEO 
        title={post.title}
        description={post.excerpt}
        type="article"
        image={post.coverImage}
        schema={schema}
      />

      <article className="bg-background">
        {/* Post Header */}
        <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 max-w-4xl">
          <Link to="/blog" className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 mb-8 transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to blog
          </Link>
          
          <div className="mb-6">
            <Badge variant="secondary" className="text-sm px-3 py-1">{post.category}</Badge>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight mb-8 leading-tight">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
            <div className="flex items-center gap-3">
              <img src={post.author.avatar} alt={post.author.name} className="w-12 h-12 rounded-full" referrerPolicy="no-referrer" />
              <div>
                <div className="font-semibold text-foreground">{post.author.name}</div>
                <div className="text-sm">{post.author.role}</div>
              </div>
            </div>
            
            <div className="hidden sm:block w-px h-8 bg-border"></div>
            
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <time dateTime={post.date}>{format(parseISO(post.date), 'MMMM d, yyyy')}</time>
              </div>
              <div className="flex items-center gap-2">
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
              src={post.coverImage} 
              alt={post.title} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Post Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl pb-20">
          <div className="prose prose-invert prose-lg max-w-none prose-headings:font-bold prose-a:text-primary hover:prose-a:text-primary/80 prose-img:rounded-xl">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>

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
                      src={related.coverImage} 
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
