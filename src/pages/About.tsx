import { SEO } from '../components/SEO';
import { generateBreadcrumbSchema } from '../lib/seo';

export default function About() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'About Us', item: '/about' }
  ]);

  return (
    <>
      <SEO 
        title="About Us"
        description="Learn more about TechNova and our mission to decode the future of technology."
        url="https://tech-nova-iota.vercel.app/about"
        schema={breadcrumbSchema}
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-3xl">
        <h1 className="text-4xl font-bold text-foreground mb-8">About TechNova</h1>
        
        <div className="prose prose-slate dark:prose-invert prose-lg max-w-none">
          <p className="lead text-xl text-muted-foreground mb-8">
            TechNova is a premier destination for technology professionals, developers, and enthusiasts looking to stay ahead of the curve.
          </p>
          
          <h2>Our Mission</h2>
          <p>
            We believe that technology is the most powerful force shaping our future. Our mission is to decode complex technological advancements and present them in clear, actionable, and insightful ways. Whether it's the latest breakthrough in Artificial Intelligence, evolving cybersecurity threats, or modern web development paradigms, we've got you covered.
          </p>

          <h2>What We Cover</h2>
          <ul>
            <li><strong>Artificial Intelligence:</strong> Machine learning, generative AI, and their practical applications.</li>
            <li><strong>Web Development:</strong> Frontend frameworks, backend architecture, and best practices.</li>
            <li><strong>Cybersecurity:</strong> Threat analysis, zero-trust architecture, and data protection.</li>
            <li><strong>Tech News:</strong> The most important updates from the tech industry.</li>
          </ul>

          <h2>Our Team</h2>
          <p>
            Our writers are industry practitioners—senior developers, security analysts, and AI researchers who bring real-world experience to every article they write. We prioritize depth, accuracy, and practical value over clickbait.
          </p>
        </div>
      </div>
    </>
  );
}
