import { SEO } from '../components/SEO';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { generateBreadcrumbSchema, generateContactPageSchema, BASE_URL, generateFAQSchema } from '../lib/seo';
import { Mail, MapPin, Clock } from 'lucide-react';

export default function Contact() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Contact Us', item: '/contact' }
  ], `${BASE_URL}/contact/#breadcrumb`);

  const contactSchema = generateContactPageSchema();

  const faqs = [
    {
      question: "How long does it take for TechNova to respond?",
      answer: "We aim to respond to all technical queries and partnership requests within 24 to 48 business hours."
    },
    {
      question: "Do you accept guest posts or technical contributions?",
      answer: "Yes. TechNova actively looks for experienced software engineers and AI researchers to contribute deep-dive tutorials. Please include 'Guest Post Pitch' in your message subject."
    },
    {
      question: "Can I hire the TechNova team for software consulting?",
      answer: "Our core team members occasionally take on specialized enterprise software consulting and Generative AI implementation projects. Please detail your project scope in the message."
    }
  ];

  const faqSchema = generateFAQSchema(faqs);

  return (
    <>
      <SEO 
        title="Contact Us | TechNova Support & Pitch Guidelines"
        description="Get in touch with the TechNova team. Reach out for technical support, partnership inquiries, or to pitch an article to our editorial team."
        keywords={['contact', 'support', 'feedback', 'TechNova', 'write for us']}
        schema={[breadcrumbSchema, contactSchema, faqSchema]}
        url={`${BASE_URL}/contact`}
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-12">
          
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-4">Contact Us</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Have a question, feedback, or want to contribute? We're a team of active developers and researchers, so we love discussing complex topics. Fill out the form and we'll get back to you.
            </p>

            <div className="space-y-6 mb-12">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg text-primary">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Email</h3>
                  <p className="text-muted-foreground">hello@tech-nova-iota.vercel.app</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg text-primary">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Response Time</h3>
                  <p className="text-muted-foreground">Within 24-48 business hours.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg text-primary">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Location</h3>
                  <p className="text-muted-foreground">101 Tech Hub Square, Silicon Valley, CA</p>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-8 hidden md:block">
              <h2 className="text-2xl font-bold text-foreground mb-6">Frequently Asked Questions</h2>
              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <div key={index}>
                    <h3 className="font-semibold text-foreground mb-2">{faq.question}</h3>
                    <p className="text-sm text-muted-foreground">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-card border border-border p-8 rounded-2xl shadow-sm h-fit">
            <h2 className="text-2xl font-bold text-foreground mb-6">Send a Message</h2>
            <form action="https://api.web3forms.com/submit" method="POST" className="space-y-6">
              <input type="hidden" name="access_key" value="d5097f40-85ff-41f8-9552-2eea068cdfd6" />
              
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium text-foreground">First Name</label>
                  <Input id="firstName" name="First Name" placeholder="John" required className="bg-background border-border" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium text-foreground">Last Name</label>
                  <Input id="lastName" name="Last Name" placeholder="Doe" required className="bg-background border-border" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">Email Address</label>
                <Input id="email" type="email" name="email" placeholder="john@example.com" required className="bg-background border-border" />
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium text-foreground">Subject</label>
                <Input id="subject" name="subject" placeholder="How can we help?" required className="bg-background border-border" />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-foreground">Message</label>
                <textarea 
                  id="message" 
                  name="message"
                  rows={6}
                  className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                  placeholder="Your message here..."
                  required
                ></textarea>
              </div>

              <Button type="submit" size="lg" className="w-full">
                Send Message
              </Button>
            </form>
          </div>
          
          <div className="border-t border-border pt-8 md:hidden">
            <h2 className="text-2xl font-bold text-foreground mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index}>
                  <h3 className="font-semibold text-foreground mb-2">{faq.question}</h3>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
