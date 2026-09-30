'use client';

import { Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { loginSchema, type LoginFormValues } from '@/lib/validation/auth';
import { toast } from '@/hooks/useToast';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginUser } from '@/store/thunks/authThunks';
import { ROUTES } from '@/constants/routes';

function LoginForm() {
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
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  // Already signed in? Redirect
  useEffect(() => {
    if (isAuthenticated) {
      router.replace(redirect);
    }
  }, [isAuthenticated, redirect, router]);

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      await dispatch(loginUser(data)).unwrap();
      toast.success('Welcome back');
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
        <p className="label-luxe">Sign in</p>
        <h1 className="heading-luxe mt-3 text-4xl">Welcome back.</h1>
        <p className="mt-3 text-sm text-ink-soft">
          Sign in to access your orders, wishlist, and saved addresses.
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

        <div>
          <div className="mb-2 flex items-center justify-between">
            <Label
              htmlFor="password"
              className="text-[10px] uppercase tracking-[0.14em] text-forest-900"
            >
              Password
            </Label>
            <Link
              href={ROUTES.forgotPassword}
              className="text-[10px] uppercase tracking-[0.14em] text-ink-muted transition-colors hover:text-forest-900"
            >
              Forgot?
            </Link>
          </div>

          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
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
          {isSubmitting ? 'Signing in…' : 'Sign In'}
        </Button>
      </form>

      {/* Footer */}
      <p className="mt-8 text-center text-sm text-ink-soft">
        New to LUXE?{' '}
        <Link
          href={ROUTES.register}
          className="text-forest-900 underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="py-20" />}>
      <LoginForm />
    </Suspense>
  );
}
