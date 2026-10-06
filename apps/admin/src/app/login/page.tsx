'use client';

import { useEffect, useState } from 'react';

export const dynamic = 'force-dynamic';
import { useRouter } from 'next/navigation';
import { useLogin, useIsAuthenticated } from '@refinedev/core';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { loginSchema, type LoginFormValues } from '@/lib/validation/auth';

export default function LoginPage() {
  const router = useRouter();
  const { data: auth, isLoading: isCheckingAuth } = useIsAuthenticated();
  const { mutate: login, data, error, isPending } = useLogin<LoginFormValues>();

  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Redirect if already logged in
  useEffect(() => {
    if (!isCheckingAuth && auth?.authenticated) {
      router.replace('/dashboard');
    }
  }, [auth, isCheckingAuth, router]);

  const onSubmit = (values: LoginFormValues) => {
    login(values);
  };

  // Extract error message
  const errorMessage = (() => {
    if (!error) return null;
    if (typeof error === 'string') return error;
    if (typeof error === 'object' && 'message' in error) {
      return (error as { message?: string }).message ?? 'Login failed';
    }
    return 'Login failed. Please try again.';
  })();

  return (
    <div className="flex min-h-screen bg-forest-900">
      {/* Left side — brand panel (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative overflow-hidden">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-forest-950 via-forest-900 to-forest-800" />

        <div className="relative z-10 max-w-md">
          <div className="font-serif text-5xl tracking-[0.3em] text-cream-100">
            LUXE
          </div>
          <p className="mt-8 text-lg leading-relaxed text-cream-200/70">
            Timepieces for those who measure moments, not minutes.
          </p>
          <div className="mt-12 h-px w-16 bg-cream-600" />
          <p className="mt-6 text-xs uppercase tracking-[0.18em] text-cream-200/50">
            Operations Cockpit
          </p>
        </div>
      </div>

      {/* Right side — login form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-cream-100 p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-10 text-center lg:hidden">
            <div className="font-serif text-3xl tracking-[0.25em] text-forest-900">
              LUXE
            </div>
            <p className="mt-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Admin Portal
            </p>
          </div>

          {/* Desktop heading */}
          <div className="mb-8 hidden lg:block">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Welcome back
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-forest-900">
              Sign in to continue.
            </h1>
          </div>

          {/* Error alert */}
          {errorMessage && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium uppercase tracking-[0.14em] text-forest-900">
                      Email
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          {...field}
                          type="email"
                          placeholder="admin@luxe.com"
                          autoComplete="email"
                          autoFocus
                          disabled={isPending}
                          className="h-11 pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium uppercase tracking-[0.14em] text-forest-900">
                      Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          {...field}
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          autoComplete="current-password"
                          disabled={isPending}
                          className="h-11 pl-10 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                          aria-label={
                            showPassword ? 'Hide password' : 'Show password'
                          }
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit */}
              <Button
                type="submit"
                disabled={isPending}
                className="h-11 w-full bg-forest-900 text-cream-100 hover:bg-forest-800"
              >
                {isPending ? 'Signing in…' : 'Sign In'}
              </Button>
            </form>
          </Form>

          {/* Footer */}
          <div className="mt-8 flex items-center justify-between text-xs text-muted-foreground">
            <p>Restricted area. Access is monitored and logged.</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-muted-foreground hover:text-foreground"
              onClick={() => {
                form.setValue('email', 'superadmin@luxe.com');
                form.setValue('password', 'YourSecurePassword123!');
              }}
            >
              Auto-fill
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
