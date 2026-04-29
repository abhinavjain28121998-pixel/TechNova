import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, BarChart3, Building2, Lightbulb, Activity, Layers, Target, TrendingUp, LineChart } from 'lucide-react';
import { SEO } from '../components/SEO';
import { Button, buttonVariants } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../components/ui/carousel';
import { Link } from 'react-router-dom';

const caseStudies = [
  {
    company: "Klarna",
    industry: "Fintech & E-commerce",
    icon: <BarChart3 className="w-8 h-8 text-primary" />,
    context: "A global payments network managing <strong class='text-primary font-bold'>millions</strong> of e-commerce transactions and customer support queries across multiple time zones.",
    problem: "Scaling customer service operations efficiently during rapid growth. Adding <strong class='text-destructive font-bold'>thousands</strong> of human agents would exponentially increase overhead, yet maintaining high customer satisfaction (CSAT) remained paramount.",
    solution: "Klarna deployed a highly capable OpenAI-powered assistant natively within their app. This system was uniquely integrated with their transactional backend, allowing it to actively process refunds, manage cancellations, and resolve disputes instead of just providing generic FAQs.",
    results: [
      "Handled <strong class='text-primary bg-primary/10 px-1 rounded font-bold'>2.3 million</strong> conversations in its first month.",
      "Delivered the equivalent work of <strong class='text-primary bg-primary/10 px-1 rounded font-bold'>700 full-time</strong> human agents.",
      "Achieved a <strong class='text-primary bg-primary/10 px-1 rounded font-bold'>25%</strong> drop in repeat inquiries.",
      "Estimated <strong class='text-primary bg-primary/10 px-1 rounded font-bold'>$40 million USD</strong> improvement in bottom-line profit over 2024."
    ],
    analysis: "Klarna succeeded by transitioning from conversational AI to 'agentic' AI. By connecting the LLM directly to core operational APIs, the tool resolves user problems instantly without requiring human escalation for routine tasks.",
    takeaway: "Transformational AI doesn't just answer questions—it executes functional tasks by integrating deeply with internal systems."
  },
  {
    company: "Morgan Stanley",
    industry: "Wealth Management & Finance",
    icon: <Building2 className="w-8 h-8 text-emerald-500" />,
    context: "A premier global financial services firm where advisors rely on a vast trove of internal investment strategies, market research, and procedural documentation.",
    problem: "The sheer volume of unstructured internal data—spanning over <strong class='text-destructive font-bold'>100,000 documents</strong>—led to significant inefficiencies. Advisors spent hours searching for specific insights, slowing down client responsiveness during critical market shifts.",
    solution: "Partnered closely with OpenAI to build an internal generative AI assistant using Retrieval-Augmented Generation (RAG). The LLM was strictly confined to synthesizing and retrieving information exclusively from Morgan Stanley's verified, proprietary intellectual property.",
    results: [
      "Instant synthesis of <strong class='text-primary bg-primary/10 px-1 rounded font-bold'>100,000+</strong> verified research documents.",
      "Massive reduction in time-to-insight for financial advisors.",
      "Maintained <strong class='text-primary bg-primary/10 px-1 rounded font-bold'>zero-hallucination</strong> compliance by isolating the model's knowledge base."
    ],
    analysis: "By restricting the AI's generation capabilities solely to verified internal data (RAG), Morgan Stanley resolved the enterprise sector's biggest fear: AI hallucinations. This maintains strict regulatory compliance while radically accelerating data retrieval.",
    takeaway: "For enterprise AI deployment, robust data governance and strict system boundaries are more critical than general-purpose model intelligence."
  },
  {
    company: "Netflix",
    industry: "Streaming Media & Entertainment",
    icon: <Target className="w-8 h-8 text-rose-500" />,
    context: "A global streaming platform scaling past <strong class='text-primary font-bold'>260 million subscribers</strong> with an overwhelmingly vast content library.",
    problem: "To prevent 'decision fatigue', where users who spend more than <strong class='text-destructive font-bold'>90 seconds</strong> attempting to find content typically abandon the platform and eventually churn.",
    solution: "An advanced, multi-layered machine learning recommendation engine. Beyond simply suggesting titles, the AI dynamically generates and tests individualized artwork/thumbnails for titles, adapting the visual presentation based on a user’s inferred psychological engagement profile and past viewing habits.",
    results: [
      "AI-driven recommendations estimate over <strong class='text-primary bg-primary/10 px-1 rounded font-bold'>$1 billion per year</strong> in retained revenue by significantly reducing subscriber churn.",
      "Maintains the industry's lowest churn rate through hyper-personalized user interfaces.",
      "Over <strong class='text-primary bg-primary/10 px-1 rounded font-bold'>80%</strong> of watched content stems directly from algorithmic recommendations."
    ],
    analysis: "Netflix realizes that user preferences dictate not only *what* they watch, but *how* it should be presented. Adapting the UI layer (the thumbnail graphics) dynamically provides the highest engagement yields.",
    takeaway: "Real personalization extends beyond predictive product recommendations—it dynamically modifies the user interface and presentation format."
  },
  {
    company: "The Hackett Group®",
    industry: "Management Consulting",
    icon: <LineChart className="w-8 h-8 text-amber-500" />,
    context: "A leading global strategic advisory and operations improvement consulting firm relying on vast amounts of proprietary benchmarking data.",
    problem: "Analyzing complex organizational performance metrics across <strong class='text-destructive font-bold'>thousands</strong> of datasets to generate actionable benchmarking insights was highly manual, delaying critical strategic advice.",
    solution: "The Hackett Group integrated an advanced generative AI platform directly into their proprietary benchmarking database. This AI acts as an expert analyst, rapidly synthesizing data and generating comparative narratives.",
    results: [
      "Accelerated the production of benchmarking reports by <strong class='text-primary bg-primary/10 px-1 rounded font-bold'>over 40%</strong>.",
      "Empowered consultants to query complex datasets using natural language, uncovering deeper insights.",
      "Maintained strict data confidentiality while <strong class='text-primary bg-primary/10 px-1 rounded font-bold'>increasing throughput</strong> of advisory services."
    ],
    analysis: "By empowering their consultants with an AI tool trained specifically on their world-class benchmarking taxonomy, The Hackett Group eliminated the data-gathering bottleneck. The AI handles the synthesis, allowing consultants to focus purely on strategic interpretation.",
    takeaway: "In knowledge-intensive industries, AI is most effective when it amplifies the capabilities of human experts, freeing them from data processing to focus on high-value strategic advisory."
  }
];

export default function CaseStudies() {
  const [selectedStudy, setSelectedStudy] = useState<typeof caseStudies[0] | null>(null);

  return (
    <>
      <SEO 
        title="Case Studies & Real-World AI Insights" 
        description="Explore how industry leaders like Netflix, Klarna, and Morgan Stanley are leveraging artificial intelligence and digital transformation to solve complex real-world business challenges."
        keywords={['AI case studies', 'real-world AI applications', 'business case studies', 'digital transformation examples', 'enterprise AI implementation']}
        url="https://tech-nova-iota.vercel.app/case-studies"
      />
      
      {/* Header Section */}
      <section className="relative overflow-hidden bg-background pt-20 pb-16 lg:pt-32 lg:pb-24 border-b border-border">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-4xl text-center">
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
                  <motion.article 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    onClick={() => setSelectedStudy(study)}
                    className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all group flex flex-col h-full"
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

      {/* Case Study Detailed Dialog */}
      <Dialog open={!!selectedStudy} onOpenChange={(open) => !open && setSelectedStudy(null)}>
        <DialogContent className="max-w-none sm:max-w-none lg:max-w-none w-screen h-[100dvh] !p-0 m-0 border-none sm:rounded-none overflow-y-auto bg-background duration-300">
          {selectedStudy && (
            <div className="mx-auto max-w-4xl p-6 md:p-12 pt-16 md:pt-20">
              <DialogHeader className="mb-10">
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  <div className="p-4 bg-muted rounded-2xl w-fit shrink-0">
                    {selectedStudy.icon}
                  </div>
                  <div className="text-left">
                    <DialogTitle className="text-4xl md:text-5xl font-bold text-foreground mb-4">{selectedStudy.company}</DialogTitle>
                    <DialogDescription className="sr-only">Detailed case study for {selectedStudy.company}</DialogDescription>
                    <div className="text-sm font-bold text-primary uppercase tracking-wider">{selectedStudy.industry}</div>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-10">
                <div>
                  <h3 className="text-xl font-semibold mb-3 flex items-center gap-2"><Layers className="w-5 h-5 text-muted-foreground" /> Context & Background</h3>
                  <p className="text-muted-foreground leading-relaxed md:text-lg" dangerouslySetInnerHTML={{ __html: selectedStudy.context }} />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-destructive/5 rounded-xl border border-destructive/10 p-6 md:p-8">
                    <h3 className="font-semibold text-destructive mb-3 text-lg">The Challenge</h3>
                    <p className="text-sm md:text-base text-foreground/80 leading-relaxed" dangerouslySetInnerHTML={{ __html: selectedStudy.problem }} />
                  </div>
                  <div className="bg-primary/5 rounded-xl border border-primary/10 p-6 md:p-8">
                    <h3 className="font-semibold text-primary mb-3 text-lg">The Strategy</h3>
                    <p className="text-sm md:text-base text-foreground/80 leading-relaxed" dangerouslySetInnerHTML={{ __html: selectedStudy.solution }} />
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4 border-b border-border pb-2">Key Results</h3>
                  <ul className="space-y-3 md:space-y-4">
                    {selectedStudy.results.map((res, i) => (
                        <li key={i} className="flex gap-4 text-muted-foreground">
                          <span className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                          <span dangerouslySetInnerHTML={{ __html: res }} className="leading-relaxed md:text-lg" />
                        </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-muted/50 rounded-xl p-6 md:p-8 border border-border">
                  <div className="flex items-start gap-4 md:gap-6">
                    <Lightbulb className="w-8 h-8 text-foreground shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-foreground mb-2 text-lg">Expert Analysis: What Worked & Why</h3>
                      <p className="text-muted-foreground mb-6 leading-relaxed md:text-lg">{selectedStudy.analysis}</p>
                      <div className="pt-5 border-t border-border/60">
                        <span className="text-xs font-bold uppercase tracking-widest text-primary block mb-2">Key Takeaway</span>
                        <p className="text-foreground font-semibold sm:text-lg italic">&ldquo;{selectedStudy.takeaway}&rdquo;</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
            <Link to="/categories" className={buttonVariants({ size: "lg", variant: "outline", className: "bg-transparent border-primary-foreground/30 hover:bg-primary-foreground/10 text-primary-foreground" })}>
              Browse Topics
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
