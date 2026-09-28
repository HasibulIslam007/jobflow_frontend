'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState, type FormEvent } from 'react';

import { RequireGuest } from '@/components/guest-guard';
import { FieldError, FormError } from '@/components/form-error';
import { ButtonSpinner, PageLoading } from '@/components/loading';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLogin } from '@/features/auth/hooks';
import { ApiError } from '@/lib/api';

/**
 * POST /api/v1/auth/login via Sanctum session cookies.
 * Field errors come from ApiError.errors (validation_failed);
 * wrong credentials surface as the `email` field error per Laravel.
 */
function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get('next');
  const { mutate: signIn, isPending, error } = useLogin();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const apiError = error instanceof ApiError ? error : null;
  const formMessage =
    apiError && !apiError.errors ? apiError.message : undefined;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    signIn({ email: email.trim(), password });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>
          {next
            ? 'Sign in to continue to your workspace.'
            : 'Sign in to your JobFlow AI workspace.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <FormError message={formMessage ?? undefined} />

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={Boolean(apiError?.errors?.email)}
              disabled={isPending}
              required
            />
            <FieldError errors={apiError?.errors} field="email" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={Boolean(apiError?.errors?.password)}
              disabled={isPending}
              required
            />
            <FieldError errors={apiError?.errors} field="password" />
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <ButtonSpinner />}
            {isPending ? 'Signing in…' : 'Sign in'}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            New to JobFlow AI?{' '}
            <Link href="/register" className="font-medium text-foreground underline-offset-4 hover:underline">
              Create an account
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <RequireGuest>
      <Suspense fallback={<PageLoading label="Loading sign in…" />}>
        <LoginForm />
      </Suspense>
    </RequireGuest>
  );
}
