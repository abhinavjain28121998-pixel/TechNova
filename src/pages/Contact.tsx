import { SEO } from '../components/SEO';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { generateBreadcrumbSchema } from '../lib/seo';

export default function Contact() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Contact Us', item: '/contact' }
  ]);

  return (
    <>
      <SEO 
        title="Contact Us"
        description="Get in touch with the TechNova team."
        url="https://tech-nova-iota.vercel.app/contact"
        schema={breadcrumbSchema}
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-2xl">
        <h1 className="text-4xl font-bold text-foreground mb-4">Contact Us</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Have a question, feedback, or want to contribute? We'd love to hear from you. Fill out the form below and we'll get back to you as soon as possible.
        </p>

        <form action="https://api.web3forms.com/submit" method="POST" className="space-y-6">
          <input type="hidden" name="access_key" value="d5097f40-85ff-41f8-9552-2eea068cdfd6" />
          
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-sm font-medium text-foreground">First Name</label>
              <Input id="firstName" name="First Name" placeholder="John" required className="bg-card border-border" />
            </div>
            <div className="space-y-2">
              <label htmlFor="lastName" className="text-sm font-medium text-foreground">Last Name</label>
              <Input id="lastName" name="Last Name" placeholder="Doe" required className="bg-card border-border" />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">Email Address</label>
            <Input id="email" type="email" name="email" placeholder="john@example.com" required className="bg-card border-border" />
          </div>

          <div className="space-y-2">
            <label htmlFor="subject" className="text-sm font-medium text-foreground">Subject</label>
            <Input id="subject" name="subject" placeholder="How can we help?" required className="bg-card border-border" />
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium text-foreground">Message</label>
            <textarea 
              id="message" 
              name="message"
              rows={6}
              className="flex w-full rounded-md border border-border bg-card px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Your message here..."
              required
            ></textarea>
          </div>

          <Button type="submit" size="lg" className="w-full sm:w-auto">
            Send Message
          </Button>
        </form>
      </div>
    </>
  );
}
