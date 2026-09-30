'use client';

import { useState } from 'react';
import { Container } from '@/components/shared/container';
import { PageHero } from '@/components/content';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/useToast';

export default function PrivateViewingPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Wire to POST /contact with subject="private-viewing" later
      await new Promise((r) => setTimeout(r, 800));
      setSubmitted(true);
      toast.success('Request received');
    } catch {
      toast.error('Could not submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHero
        overline="By Appointment"
        title="Book a Private Viewing"
        subtitle="A one-on-one session with a LUXE specialist. See pieces up close, try them on, and ask anything."
        align="center"
      />

      <Container className="py-12 md:py-20">
        <div className="mx-auto max-w-2xl">
          {submitted ? (
            <div className="border border-forest-900/10 bg-cream-100 p-10 text-center">
              <h2 className="heading-luxe text-2xl">Request received.</h2>
              <p className="mt-4 text-sm text-ink-soft">
                A LUXE specialist will contact you within 24 hours to
                confirm your appointment.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="mb-2 block text-[10px] uppercase tracking-[0.14em] text-forest-900">
                    Full Name
                  </Label>
                  <Input
                    name="name"
                    required
                    className="h-12 rounded-sm border-forest-900/20 bg-cream-50"
                  />
                </div>
                <div>
                  <Label className="mb-2 block text-[10px] uppercase tracking-[0.14em] text-forest-900">
                    Phone
                  </Label>
                  <Input
                    name="phone"
                    required
                    className="h-12 rounded-sm border-forest-900/20 bg-cream-50"
                  />
                </div>
              </div>

              <div>
                <Label className="mb-2 block text-[10px] uppercase tracking-[0.14em] text-forest-900">
                  Email
                </Label>
                <Input
                  name="email"
                  type="email"
                  required
                  className="h-12 rounded-sm border-forest-900/20 bg-cream-50"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="mb-2 block text-[10px] uppercase tracking-[0.14em] text-forest-900">
                    Preferred Location
                  </Label>
                  <Select name="location">
                    <SelectTrigger className="h-12 rounded-sm border-forest-900/20 bg-cream-50">
                      <SelectValue placeholder="Select a studio" />
                    </SelectTrigger>
                    <SelectContent className="rounded-sm border-forest-900/10 bg-cream-50">
                      <SelectItem value="bangalore">Bangalore</SelectItem>
                      <SelectItem value="mumbai">Mumbai</SelectItem>
                      <SelectItem value="delhi">Delhi</SelectItem>
                      <SelectItem value="virtual">Virtual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-2 block text-[10px] uppercase tracking-[0.14em] text-forest-900">
                    Preferred Date
                  </Label>
                  <Input
                    name="date"
                    type="date"
                    required
                    className="h-12 rounded-sm border-forest-900/20 bg-cream-50"
                  />
                </div>
              </div>

              <div>
                <Label className="mb-2 block text-[10px] uppercase tracking-[0.14em] text-forest-900">
                  Pieces of Interest (optional)
                </Label>
                <Textarea
                  name="interests"
                  rows={3}
                  placeholder="Any specific references or collections you'd like to see?"
                  className="rounded-sm border-forest-900/20 bg-cream-50"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-14 w-full rounded-sm bg-forest-900 text-xs uppercase tracking-[0.18em] text-cream-100 hover:bg-forest-800 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting…' : 'Request Appointment'}
              </Button>
            </form>
          )}
        </div>
      </Container>
    </>
  );
}
