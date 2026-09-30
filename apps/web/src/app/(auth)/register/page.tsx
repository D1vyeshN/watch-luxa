'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { registerSchema, type RegisterFormValues } from '@/lib/validation/auth';
import { toast } from '@/hooks/useToast';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { registerUser } from '@/store/thunks/authThunks';
import { ROUTES } from '@/constants/routes';

function RegisterForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  const redirect = searchParams.get('redirect') || ROUTES.home;
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const password = watch('password') || '';
  const passwordChecks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    digit: /\d/.test(password),
  };

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(redirect);
    }
  }, [isAuthenticated, redirect, router]);

  const onSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    try {
      await dispatch(registerUser(data)).unwrap();
      toast.success('Account created');
      router.replace(redirect);
    } catch (err) {
      toast.error(err as string);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Heading */}
      <div className="mb-10">
        <p className="label-luxe">Create account</p>
        <h1 className="heading-luxe mt-3 text-4xl">Join LUXE.</h1>
        <p className="mt-3 text-sm text-ink-soft">
          Save pieces to your wishlist, track orders, and enjoy private
          access.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <Label
            htmlFor="name"
            className="mb-2 block text-[10px] uppercase tracking-[0.14em] text-forest-900"
          >
            Full Name
          </Label>
          <Input
            id="name"
            autoComplete="name"
            placeholder="Rohan Sharma"
            {...register('name')}
            className="h-12 rounded-sm border-forest-900/20 bg-cream-50 focus:border-forest-900"
          />
          {errors.name && (
            <p className="mt-1.5 text-xs text-red-600">{errors.name.message}</p>
          )}
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

        <div>
          <Label
            htmlFor="password"
            className="mb-2 block text-[10px] uppercase tracking-[0.14em] text-forest-900"
          >
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              {...register('password')}
              className="h-12 rounded-sm border-forest-900/20 bg-cream-50 pr-12 focus:border-forest-900"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted transition-colors hover:text-forest-900"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Password checklist */}
          {password && (
            <ul className="mt-3 grid grid-cols-2 gap-1.5">
              {[
                { ok: passwordChecks.length, label: '8+ characters' },
                { ok: passwordChecks.uppercase, label: 'Uppercase letter' },
                { ok: passwordChecks.lowercase, label: 'Lowercase letter' },
                { ok: passwordChecks.digit, label: 'Number' },
              ].map((check) => (
                <li
                  key={check.label}
                  className={`flex items-center gap-1.5 text-[11px] ${
                    check.ok ? 'text-green-700' : 'text-ink-muted'
                  }`}
                >
                  <Check
                    className={`h-3 w-3 ${
                      check.ok ? 'opacity-100' : 'opacity-30'
                    }`}
                  />
                  {check.label}
                </li>
              ))}
            </ul>
          )}

          {errors.password && (
            <p className="mt-1.5 text-xs text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-14 w-full rounded-sm bg-forest-900 text-xs uppercase tracking-[0.18em] text-cream-100 hover:bg-forest-800 disabled:opacity-50"
        >
          {isSubmitting ? 'Creating account…' : 'Create Account'}
        </Button>

        <p className="text-center text-[10px] uppercase tracking-[0.14em] text-ink-muted">
          By signing up, you agree to our{' '}
          <Link href={ROUTES.terms} className="underline-offset-4 hover:underline">
            Terms
          </Link>{' '}
          and{' '}
          <Link href={ROUTES.privacy} className="underline-offset-4 hover:underline">
            Privacy Policy
          </Link>
        </p>
      </form>

      <p className="mt-8 text-center text-sm text-ink-soft">
        Already have an account?{' '}
        <Link
          href={ROUTES.login}
          className="text-forest-900 underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="py-20" />}>
      <RegisterForm />
    </Suspense>
  );
}
