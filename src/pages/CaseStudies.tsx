import { motion } from 'motion/react';
import { ArrowRight, BarChart3, Building2, Lightbulb, Activity, Layers, Target, TrendingUp, LineChart, Coffee, Music, ShoppingCart, Truck, Store, Landmark, Cpu, Globe } from 'lucide-react';
import { SEO } from '../components/SEO';
import { BASE_URL } from '../lib/seo';
import { Button, buttonVariants } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../components/ui/carousel';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Link } from 'react-router-dom';

import { caseStudies } from '../data/caseStudiesData';

export default function CaseStudies() {
  const caseStudiesSchema = caseStudies.map((study, index) => ({
    '@type': 'Article',
    '@id': `${BASE_URL}/case-studies/${study.slug}`,
    headline: `Case Study: ${study.company} - ${study.industry}`,
    description: study.context.replace(/<[^>]+>/g, ''),
    articleSection: study.industry,
    author: {
      '@id': `${BASE_URL}/#organization`,
    },
    publisher: {
      '@id': `${BASE_URL}/#organization`,
    },
    about: {
      '@type': 'Organization',
      name: study.company,
    },
  }));

  const pageSchema = {
    '@type': 'WebPage',
    '@id': `${BASE_URL}/case-studies`,
    name: 'Case Studies & Real-World AI Insights',
    description: 'Explore how industry leaders like Netflix, Klarna, and Morgan Stanley are leveraging artificial intelligence and digital transformation to solve complex real-world business challenges.',
    url: `${BASE_URL}/case-studies`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: caseStudies.map((study, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@id': `${BASE_URL}/case-studies/${study.slug}`
        }
      }))
    }
  };

  return (
    <>
      <SEO 
        title="Case Studies & Real-World AI Insights" 
        description="Explore how industry leaders like Netflix, Klarna, and Morgan Stanley are leveraging artificial intelligence and digital transformation to solve complex real-world business challenges."
        keywords={['AI case studies', 'real-world AI applications', 'business case studies', 'digital transformation examples', 'enterprise AI implementation']}
        url={`${BASE_URL}/case-studies`}
        schema={[pageSchema, ...caseStudiesSchema]}
      />
      
      {/* Header Section */}
      <section className="relative overflow-hidden bg-background pt-20 pb-16 lg:pt-32 lg:pb-24 border-b border-border">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-4xl text-center">
          <div className="mb-8 flex justify-center">
            <Breadcrumbs 
              items={[
                { label: 'Home', href: '/' },
                { label: 'Case Studies', href: '/case-studies' }
              ]} 
            />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Activity className="w-4 h-4" />
              <span>Real-World Implementations</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight mb-6">
              Case Studies & <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">Real-World Insights</span>
            </h1>
            <p className="text-xl text-muted-foreground md:text-2xl max-w-3xl mx-auto leading-relaxed">
              Discover how industry leaders are bridging the gap between theory and execution, utilizing artificial intelligence and digital strategies to drive measurable business transformation.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Case Studies Carousel */}
      <section className="py-20 bg-muted/30 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <Carousel
            opts={{
              align: "start",
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4 sm:-ml-6">
              {caseStudies.map((study, index) => (
                <CarouselItem key={study.company} className="pl-4 sm:pl-6 md:basis-1/2 lg:basis-1/3">
                  <Link to={`/case-studies/${study.slug}`} className="block h-full outline-none">
                    <motion.article 
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all group flex flex-col h-full"
                    >
                      <div className="p-8 flex flex-col flex-grow">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="p-3 bg-muted rounded-xl w-fit group-hover:scale-105 transition-transform">
                            {study.icon}
                          </div>
                        </div>
                        <h2 className="text-2xl font-bold text-foreground mb-2">{study.company}</h2>
                        <div className="text-sm font-medium text-primary uppercase tracking-wider mb-4">{study.industry}</div>
                        <div className="text-muted-foreground line-clamp-3 mb-8 flex-grow text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: study.context }} />
                        
                        <div className="flex items-center text-primary font-semibold text-sm mt-auto w-fit group-hover:translate-x-2 transition-transform">
                          Read Full Case Study <ArrowRight className="w-4 h-4 ml-2" />
                        </div>
                      </div>
                    </motion.article>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center gap-4 mt-10">
              <CarouselPrevious className="relative inset-auto translate-x-0 translate-y-0 h-10 w-10 border-primary/20 text-primary hover:bg-primary/10" />
              <CarouselNext className="relative inset-auto translate-x-0 translate-y-0 h-10 w-10 border-primary/20 text-primary hover:bg-primary/10" />
            </div>
          </Carousel>
        </div>
      </section>

      {/* Key Trends Section */}
      <section className="py-24 bg-background border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Key Trends Across Case Studies</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Analyzing successful implementations reveals clear patterns dictating how enterprise entities extract tangible ROI from digital transformation.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-card hover:bg-muted/30 transition-colors">
              <CardHeader>
                <TrendingUp className="w-8 h-8 text-primary mb-3" />
                <CardTitle className="text-xl">AI Adoption at Scale</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">Organizations are moving past simple advisory tools and pilots towards deep, enterprise-wide AI adoption that fundamentally rewrites their core software architectures.</p>
              </CardContent>
            </Card>

            <Card className="bg-card hover:bg-muted/30 transition-colors">
              <CardHeader>
                <Activity className="w-8 h-8 text-primary mb-3" />
                <CardTitle className="text-xl">Intelligent Automation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">Routine decision-making is being assigned to "Agentic" workflows—AI firmly tied to internal APIs capable of independently executing operational actions efficiently without human bottlenecks.</p>
              </CardContent>
            </Card>

            <Card className="bg-card hover:bg-muted/30 transition-colors">
              <CardHeader>
                <Lightbulb className="w-8 h-8 text-primary mb-3" />
                <CardTitle className="text-xl">Hyper-Personalization</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">Value is being driven by predicting user presentation preferences. Dynamic adjustments in user interfaces and tailored visual delivery significantly outperform standard product recommendation filters.</p>
              </CardContent>
            </Card>

            <Card className="bg-card hover:bg-muted/30 transition-colors">
              <CardHeader>
                <Building2 className="w-8 h-8 text-primary mb-3" />
                <CardTitle className="text-xl">Operational Resilience</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">Retrieval-Augmented Generation (RAG) and strict data governance are cementing themselves as corporate standards, creating resilience against AI hallucinations and ensuring regulatory compliance.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Stay Ahead of the Curve</h2>
          <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
            Get more deep-dive analyses, strategic frameworks, and technical insights delivered directly to you. Expand your knowledge on how tomorrow's architecture is built today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/blog" className={buttonVariants({ size: "lg", variant: "secondary", className: "font-semibold shadow-lg" })}>
              Explore More Insights <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
