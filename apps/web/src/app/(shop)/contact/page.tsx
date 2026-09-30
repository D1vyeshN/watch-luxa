'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { Container } from '@/components/shared/container';
import { PageHero } from '@/components/content';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/useToast';

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Wire to POST /contact in a later step
      await new Promise((r) => setTimeout(r, 800));
      setSubmitted(true);
      toast.success('Message sent');
    } catch {
      toast.error('Could not send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHero
        overline="Contact"
        title="Get in Touch"
        subtitle="Questions about a piece, an order, or a private viewing? Write to us."
        align="center"
      />

      <Container className="py-12 md:py-20">
        <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-[1fr_360px]">
          {/* Form */}
          <div>
            {submitted ? (
              <div className="border border-forest-900/10 bg-cream-100 p-10 text-center">
                <h2 className="heading-luxe text-2xl">Message received.</h2>
                <p className="mt-4 text-sm text-ink-soft">
                  Thank you. We will respond to your enquiry within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label
                      htmlFor="name"
                      className="mb-2 block text-[10px] uppercase tracking-[0.14em] text-forest-900"
                    >
                      Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      required
                      className="h-12 rounded-sm border-forest-900/20 bg-cream-50"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="email"
                      className="mb-2 block text-[10px] uppercase tracking-[0.14em] text-forest-900"
                    >
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="h-12 rounded-sm border-forest-900/20 bg-cream-50"
                    />
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="subject"
                    className="mb-2 block text-[10px] uppercase tracking-[0.14em] text-forest-900"
                  >
                    Subject
                  </Label>
                  <Input
                    id="subject"
                    name="subject"
                    required
                    className="h-12 rounded-sm border-forest-900/20 bg-cream-50"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="message"
                    className="mb-2 block text-[10px] uppercase tracking-[0.14em] text-forest-900"
                  >
                    Message
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    className="rounded-sm border-forest-900/20 bg-cream-50"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-14 w-full rounded-sm bg-forest-900 text-xs uppercase tracking-[0.18em] text-cream-100 hover:bg-forest-800 disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending…' : 'Send Message'}
                </Button>
              </form>
            )}
          </div>

          {/* Contact info */}
          <aside className="space-y-8">
            <div>
              <div className="flex items-center gap-3 text-forest-900">
                <Mail className="h-4 w-4" strokeWidth={1.5} />
                <p className="label-luxe">Email</p>
              </div>
              <p className="mt-3 text-sm text-ink-soft">
                hello@luxe.com
              </p>
            </div>

            <div>
              <div className="flex items-center gap-3 text-forest-900">
                <Phone className="h-4 w-4" strokeWidth={1.5} />
                <p className="label-luxe">Phone</p>
              </div>
              <p className="mt-3 text-sm text-ink-soft">
                +91 98765 43210
              </p>
              <p className="mt-1 text-xs text-ink-muted">
                Mon–Fri, 10am–6pm IST
              </p>
            </div>

            <div>
              <div className="flex items-center gap-3 text-forest-900">
                <MapPin className="h-4 w-4" strokeWidth={1.5} />
                <p className="label-luxe">Studio</p>
              </div>
              <p className="mt-3 text-sm text-ink-soft">
                42 MG Road
                <br />
                Bangalore 560001
                <br />
                India
              </p>
            </div>
          </aside>
        </div>
      </Container>
    </>
  );
}
