import { useParams, Navigate, Link } from 'react-router-dom';
import { ArrowLeft, Layers, Lightbulb } from 'lucide-react';
import { SEO } from '../components/SEO';
import { BASE_URL } from '../lib/seo';
import { caseStudies } from '../data/caseStudiesData';
import { Breadcrumbs } from '../components/Breadcrumbs';

export default function CaseStudy() {
  const { slug } = useParams<{ slug: string }>();
  const study = caseStudies.find(s => s.slug === slug);

  if (!study) {
    return <Navigate to="/case-studies" replace />;
  }

  const caseStudySchema = {
    '@type': 'Article',
    '@id': `${BASE_URL}/case-studies/${study.slug}#article`,
    headline: `Case Study: ${study.company} - ${study.industry}`,
    description: study.context.replace(/<[^>]+>/g, ''),
    articleSection: study.industry,
    author: {
      '@type': 'Organization',
      name: 'TechNova', // Fallback organization name, replace with real if exists
      '@id': `${BASE_URL}/#organization`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'TechNova',
      '@id': `${BASE_URL}/#organization`,
    },
    about: {
      '@type': 'Organization',
      name: study.company,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/case-studies/${study.slug}`
    }
  };

  return (
    <>
      <SEO 
        title={`Case Study: ${study.company} | TechNova`} 
        description={study.context.replace(/<[^>]+>/g, '').substring(0, 160) + '...'}
        url={`${BASE_URL}/case-studies/${study.slug}`}
        schema={[caseStudySchema]}
      />
      
      <article className="bg-background min-h-screen pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl pt-24 pb-12">
          <div className="mb-8">
            <Breadcrumbs 
              items={[
                { label: 'Home', href: '/' },
                { label: 'Case Studies', href: '/case-studies' },
                { label: study.company, href: `/case-studies/${study.slug}` }
              ]} 
            />
          </div>

          <Link to="/case-studies" className="inline-flex items-center text-primary font-medium hover:underline mb-8 transition-all hover:-translate-x-1">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Case Studies
          </Link>

          <header className="mb-12">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="p-4 bg-muted rounded-2xl w-fit shrink-0">
                {study.icon}
              </div>
              <div className="text-left">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 tracking-tight">{study.company}</h1>
                <div className="text-sm font-bold text-primary uppercase tracking-wider">{study.industry}</div>
              </div>
            </div>
          </header>

          <div className="space-y-12">
            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 border-b border-border pb-2"><Layers className="w-6 h-6 text-muted-foreground" /> Context & Background</h2>
              <div className="text-muted-foreground space-y-4 leading-relaxed text-lg" dangerouslySetInnerHTML={{ __html: study.context }} />
            </section>

            <div className="grid md:grid-cols-2 gap-8">
              <section className="bg-destructive/5 rounded-2xl border border-destructive/10 p-8 shadow-sm">
                <h2 className="font-bold text-destructive mb-4 text-xl">The Challenge</h2>
                <div className="text-foreground/80 space-y-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: study.problem }} />
              </section>
              <section className="bg-primary/5 rounded-2xl border border-primary/10 p-8 shadow-sm">
                <h2 className="font-bold text-primary mb-4 text-xl">The Strategy</h2>
                <div className="text-foreground/80 space-y-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: study.solution }} />
              </section>
            </div>

            <section>
              <h2 className="text-2xl font-semibold mb-6 border-b border-border pb-2">Key Results</h2>
              <ul className="space-y-4">
                {study.results.map((res, i) => (
                    <li key={i} className="flex gap-4 text-muted-foreground bg-card border border-border p-5 rounded-xl shadow-sm">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary mt-2 shrink-0" />
                      <span dangerouslySetInnerHTML={{ __html: res }} className="leading-relaxed text-lg" />
                    </li>
                ))}
              </ul>
            </section>

            <section className="bg-muted/30 rounded-2xl p-8 md:p-10 border border-border shadow-sm">
              <div className="flex items-start gap-4 md:gap-6">
                <Lightbulb className="w-10 h-10 text-primary shrink-0" />
                <div>
                  <h2 className="font-bold text-foreground mb-3 text-2xl">Expert Analysis: What Worked & Why</h2>
                  <p className="text-muted-foreground mb-8 leading-relaxed text-lg">{study.analysis}</p>
                  <div className="pt-6 border-t border-border">
                    <span className="text-sm font-bold uppercase tracking-widest text-primary block mb-3">Key Takeaway</span>
                    <p className="text-foreground font-semibold text-xl italic border-l-4 border-primary pl-4">&ldquo;{study.takeaway}&rdquo;</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </article>
    </>
  );
}
