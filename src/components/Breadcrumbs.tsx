import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { generateBreadcrumbSchema } from '../lib/seo';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const schemaItems = items.map((item) => ({
    name: item.label,
    item: item.href || '',
  }));

  const breadcrumbSchema = generateBreadcrumbSchema(schemaItems);

  return (
    <>
      <Helmet>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      </Helmet>
      <nav className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground overflow-x-auto whitespace-nowrap pb-2 scrollbar-none" aria-label="Breadcrumb">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <div key={index} className="flex items-center gap-2">
              {isLast ? (
                <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-none" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link to={item.href || '#'} className="hover:text-primary transition-colors">
                  {item.label}
                </Link>
              )}
              
              {!isLast && <ChevronRight className="w-4 h-4 flex-shrink-0" />}
            </div>
          );
        })}
      </nav>
    </>
  );
}
