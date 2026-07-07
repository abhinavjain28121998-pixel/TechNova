import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Mail, CheckCircle2, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Please enter a valid email address.');
      setStatus('error');
      return;
    }

    setErrorMessage('');
    setStatus('submitting');

    try {
      const subscribersRef = collection(db, 'subscribers');
      await addDoc(subscribersRef, {
        email: email.trim().toLowerCase(),
        name: name.trim() || null,
        subscribedAt: new Date().toISOString(),
        status: 'active',
        source: 'article_footer'
      });

      setStatus('success');
      setEmail('');
      setName('');
    } catch (err: any) {
      console.group('Newsletter Subscription Error');
      console.error('Full error object:', err);
      console.error('Error message:', err.message);
      if (err.code) console.error('Error code:', err.code);
      if (err.status) console.error('Status code:', err.status);
      if (err.details) console.error('Error details:', err.details);
      console.groupEnd();
      
      setErrorMessage(err.message || 'Verification or writing failed. Please check your internet connection.');
      setStatus('error');
    }
  };

  return (
    <Card className="relative overflow-hidden border border-border bg-gradient-to-br from-card to-secondary/30 shadow-md my-12" id="newsletter-signup-card">
      {/* Decorative Blur Background Graphic */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

      <CardContent className="p-6 sm:p-8 md:p-10">
        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center text-center py-6"
            >
              <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 flex items-center justify-center rounded-full mb-4 shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Welcome to TechNova Insights!</h3>
              <p className="text-muted-foreground text-sm max-w-md leading-relaxed">
                Thank you for subscribing. We have added your email to our VIP reader list. Get ready for premium research, expert guidelines, and executive AI summaries directly in your inbox.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start md:items-center">
                <div className="flex-1 space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Exclusive Research Weekly</span>
                  </div>
                  <h3 className="text-2xl font-extrabold text-foreground tracking-tight leading-tight">
                    Stay Ahead of the Applied AI Frontier
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Join over 50,000+ industry vanguard leaders who receive our peer-reviewed briefs, real-world case studies, and actionable HR & GBS transformation roadmaps. No spam, ever.
                  </p>
                </div>

                <div className="w-full md:w-[340px] shrink-0">
                  <form onSubmit={handleSubscribe} className="space-y-3.5" aria-label="Newsletter Signup Form">
                    <div className="space-y-1">
                      <label htmlFor="newsletter-name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        First Name <span className="text-muted-foreground/50 text-[10px]">(Optional)</span>
                      </label>
                      <Input
                        id="newsletter-name"
                        type="text"
                        placeholder="John"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-background border-border h-9 text-sm"
                        disabled={status === 'submitting'}
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="newsletter-email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Email Address
                      </label>
                      <div className="relative">
                        <Input
                          id="newsletter-email"
                          type="email"
                          placeholder="john.doe@company.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-9 bg-background border-border h-9 text-sm"
                          disabled={status === 'submitting'}
                          required
                        />
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
                      </div>
                    </div>

                    {status === 'error' && errorMessage && (
                      <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 p-2.5 rounded-md leading-relaxed">
                        {errorMessage}
                      </p>
                    )}

                    <Button
                      type="submit"
                      className="w-full h-9 bg-primary text-primary-foreground hover:bg-primary/95 shadow-sm transition-all text-sm font-semibold flex items-center justify-center gap-2 group"
                      disabled={status === 'submitting'}
                    >
                      {status === 'submitting' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Subscribing...
                        </>
                      ) : (
                        <>
                          Subscribe to Briefs
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                        </>
                      )}
                    </Button>
                  </form>
                  <p className="text-[10px] text-muted-foreground text-center mt-3 leading-relaxed">
                    By subscribing, you agree to our privacy policy. You can opt-out at any time with a single click.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
