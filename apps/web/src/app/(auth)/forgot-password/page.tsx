'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '@/lib/validation/auth';
import { toast } from '@/hooks/useToast';
import { ROUTES } from '@/constants/routes';

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Wire to POST /auth/forgot-password in a later step
      await new Promise((r) => setTimeout(r, 800));
      setIsSubmitted(true);
    } catch {
      toast.error('Could not send reset email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <>
        <div className="mb-10">
          <p className="label-luxe">Check your inbox</p>
          <h1 className="heading-luxe mt-3 text-4xl">Email sent.</h1>
          <p className="mt-3 text-sm text-ink-soft">
            If an account exists for{' '}
            <span className="font-medium text-forest-900">
              {getValues('email')}
            </span>
            , we&apos;ve sent instructions to reset your password.
          </p>
        </div>

        <div className="rounded-sm border border-forest-900/10 bg-cream-50 p-5">
          <p className="text-xs text-ink-soft">
            Didn&apos;t receive the email? Check your spam folder, or try again in
            a few minutes.
          </p>
        </div>

        <Link
          href={ROUTES.login}
          className="mt-8 flex items-center justify-center gap-2 text-xs uppercase tracking-[0.18em] text-forest-900 underline-offset-4 hover:underline"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to sign in
        </Link>
      </>
    );
  }

  return (
    <>
      {/* Heading */}
      <div className="mb-10">
        <p className="label-luxe">Reset password</p>
        <h1 className="heading-luxe mt-3 text-4xl">Forgot your password?</h1>
        <p className="mt-3 text-sm text-ink-soft">
          Enter your email and we&apos;ll send instructions to reset it.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <Label
            htmlFor="email"
            className="mb-2 block text-[10px] uppercase tracking-[0.14em] text-forest-900"
          >
            Email
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...register('email')}
            className="h-12 rounded-sm border-forest-900/20 bg-cream-50 focus:border-forest-900"
          />
          {errors.email && (
            <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-14 w-full rounded-sm bg-forest-900 text-xs uppercase tracking-[0.18em] text-cream-100 hover:bg-forest-800 disabled:opacity-50"
        >
          {isSubmitting ? 'Sending…' : 'Send Reset Link'}
        </Button>
      </form>

      <Link
        href={ROUTES.login}
        className="mt-8 flex items-center justify-center gap-2 text-xs uppercase tracking-[0.18em] text-forest-900 underline-offset-4 hover:underline"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to sign in
      </Link>
    </>
  );
}
