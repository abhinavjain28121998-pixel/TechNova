import { SEO } from '../components/SEO';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <>
      <SEO 
        title="Page Not Found | TechNova"
        description="The page you are looking for does not exist or has been moved."
        url="https://tech-nova-iota.vercel.app/404"
        noindex
      />
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 max-w-2xl mx-auto">
        <div className="bg-primary/10 p-6 rounded-full mb-8 inline-block animate-pulse">
          <FileQuestion className="w-16 h-16 text-primary" />
        </div>
        
        <h1 className="text-6xl font-bold mb-4 tracking-tight">404</h1>
        <h2 className="text-2xl md:text-3xl font-semibold mb-6">Page Not Found</h2>
        
        <p className="text-lg text-muted-foreground mb-10 max-w-lg mx-auto">
          We couldn't find the page you're looking for. It might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link to="/" className="w-full sm:w-auto">
            <Button size="lg" className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Back to Homepage
            </Button>
          </Link>
          <Link to="/blog" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Read Our Blog
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}
