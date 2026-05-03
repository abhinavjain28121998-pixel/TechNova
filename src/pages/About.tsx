import { SEO } from '../components/SEO';
import { generateBreadcrumbSchema, generateAboutPageSchema, BASE_URL } from '../lib/seo';
import { motion } from 'motion/react';
import { Code, Shield, Bot, Newspaper, Zap, Users, Target } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';

export default function About() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'About Us', item: '/about' }
  ]);

  const aboutSchema = generateAboutPageSchema();
  
  const coreValues = [
    {
      icon: <Target className="w-6 h-6 text-primary" />,
      title: "Accuracy First",
      description: "We prioritize fact-checking, deep research, and technical correctness over speed to publish."
    },
    {
      icon: <Zap className="w-6 h-6 text-primary" />,
      title: "Actionable Insights",
      description: "Our content isn't just theory. We provide practical tutorials and takeaways you can use."
    },
    {
      icon: <Users className="w-6 h-6 text-primary" />,
      title: "Community Driven",
      description: "We listen to our readers and cover the topics that matter most to developers today."
    }
  ];

  const topics = [
    {
      icon: <Bot className="w-8 h-8 mb-4 text-blue-500" />,
      title: "Artificial Intelligence",
      description: "Machine learning, generative AI, and their practical applications in software development."
    },
    {
      icon: <Code className="w-8 h-8 mb-4 text-emerald-500" />,
      title: "Web Development",
      description: "Frontend frameworks, backend architecture, scalable systems, and best practices."
    },
    {
      icon: <Shield className="w-8 h-8 mb-4 text-rose-500" />,
      title: "Cybersecurity",
      description: "Threat analysis, zero-trust architecture, data protection, and secure coding."
    },
    {
      icon: <Newspaper className="w-8 h-8 mb-4 text-purple-500" />,
      title: "Tech News",
      description: "The most important updates, framework releases, and industry shifts."
    }
  ];

  return (
    <>
      <SEO 
        title="About TechNova Blog | Our Mission & Values"
        description="Discover the story behind TechNova Blog. We are a team of industry practitioners delivering deep research, tutorials, and practical insights into AI and software engineering."
        url={`${BASE_URL}/about`}
        keywords={['about us', 'TechNova Blog', 'technology blog', 'tech news', 'tech writers']}
        schema={[breadcrumbSchema, aboutSchema]}
      />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background pt-20 pb-16 lg:pt-32 lg:pb-24 border-b border-border">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-4xl text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight mb-6"
          >
            Build the <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">Future</span> of Software & AI
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-muted-foreground md:text-2xl max-w-3xl mx-auto leading-relaxed"
          >
            TechNova Blog is a premier destination for technology professionals, developers, and tech leaders looking to master modern engineering and stay ahead of the curve.
          </motion.p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold text-foreground mb-6">Our Mission</h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                We believe that technology is the most powerful force shaping our future. Our mission is to decode complex technological advancements and present them in clear, actionable, and insightful ways.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our writers are industry practitioners—senior developers, security analysts, and AI researchers who bring real-world experience to every article they write. We prioritize depth, accuracy, and practical value over clickbait.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid gap-6"
            >
              {coreValues.map((value, index) => (
                <div key={index} className="flex gap-4 p-6 bg-card rounded-xl border border-border/50 shadow-sm">
                  <div className="flex-shrink-0 mt-1">
                    {value.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* What We Cover Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">What We Cover</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We focus on the most impactful areas of modern technology, delivering insights that matter to software engineers and tech leaders.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {topics.map((topic, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full bg-card hover:bg-muted/50 transition-colors border-border/50">
                  <CardHeader>
                    {topic.icon}
                    <CardTitle className="text-xl">{topic.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{topic.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
