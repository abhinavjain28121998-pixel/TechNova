import { useState } from 'react';
import { SEO } from '../components/SEO';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { generateBreadcrumbSchema } from '../lib/seo';

// @ts-ignore - Vite env types
const getAccessKey = () => import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || 'd5097f40-85ff-41f8-9552-2eea068cdfd6';

export default function Contact() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    const accessKey = getAccessKey();
    if (!accessKey) {
      console.error('Web3Forms access key is missing. Please add VITE_WEB3FORMS_ACCESS_KEY to your environment variables.');
      setStatus('error');
      return;
    }

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          access_key: accessKey,
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          from_name: 'TechNova Contact Form',
        }),
      });

      const result = await response.json();
      if (result.success) {
        setStatus('success');
        setFormData({ firstName: '', lastName: '', email: '', subject: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

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

        <form className="space-y-6" onSubmit={handleSubmit}>
          {status === 'success' && (
            <div className="p-4 rounded-md bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400">
              Thank you! Your message has been sent successfully.
            </div>
          )}
          {status === 'error' && (
            <div className="p-4 rounded-md bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400">
              Oops! Something went wrong. Please make sure you have configured the Web3Forms access key.
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-sm font-medium text-foreground">First Name</label>
              <Input id="firstName" value={formData.firstName} onChange={handleChange} placeholder="John" required className="bg-card border-border" disabled={status === 'submitting'} />
            </div>
            <div className="space-y-2">
              <label htmlFor="lastName" className="text-sm font-medium text-foreground">Last Name</label>
              <Input id="lastName" value={formData.lastName} onChange={handleChange} placeholder="Doe" required className="bg-card border-border" disabled={status === 'submitting'} />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">Email Address</label>
            <Input id="email" type="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" required className="bg-card border-border" disabled={status === 'submitting'} />
          </div>

          <div className="space-y-2">
            <label htmlFor="subject" className="text-sm font-medium text-foreground">Subject</label>
            <Input id="subject" value={formData.subject} onChange={handleChange} placeholder="How can we help?" required className="bg-card border-border" disabled={status === 'submitting'} />
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium text-foreground">Message</label>
            <textarea 
              id="message" 
              rows={6}
              value={formData.message}
              onChange={handleChange}
              className="flex w-full rounded-md border border-border bg-card px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Your message here..."
              required
              disabled={status === 'submitting'}
            ></textarea>
          </div>

          <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={status === 'submitting'}>
            {status === 'submitting' ? 'Sending...' : 'Send Message'}
          </Button>
        </form>
      </div>
    </>
  );
}
