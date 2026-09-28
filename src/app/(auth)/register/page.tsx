'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';

import { RequireGuest } from '@/components/guest-guard';
import { FieldError, FormError } from '@/components/form-error';
import { ButtonSpinner } from '@/components/loading';
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
import { useRegister } from '@/features/auth/hooks';
import { ApiError } from '@/lib/api';

/**
 * POST /api/v1/auth/register via Sanctum session cookies.
 * Sends password_confirmation to satisfy Laravel's `confirmed` rule.
 */
export default function RegisterPage() {
  const { mutate: signUp, isPending, error } = useRegister();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  const apiError = error instanceof ApiError ? error : null;
  const formMessage =
    apiError && !apiError.errors ? apiError.message : undefined;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    signUp({
      name: name.trim(),
      email: email.trim(),
      password,
      password_confirmation: passwordConfirmation,
    });
  }

  return (
    <RequireGuest>
      <Card>
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>
            Start capturing jobs with AI in under a minute.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <FormError message={formMessage ?? undefined} />

            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="Jane Doe"
                value={name}
                onChange={(event) => setName(event.target.value)}
                aria-invalid={Boolean(apiError?.errors?.name)}
                disabled={isPending}
                required
              />
              <FieldError errors={apiError?.errors} field="name" />
            </div>

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

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  aria-invalid={Boolean(apiError?.errors?.password)}
                  disabled={isPending}
                  required
                />
                <FieldError errors={apiError?.errors} field="password" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password_confirmation">Confirm password</Label>
                <Input
                  id="password_confirmation"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={passwordConfirmation}
                  onChange={(event) =>
                    setPasswordConfirmation(event.target.value)
                  }
                  disabled={isPending}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <ButtonSpinner />}
              {isPending ? 'Creating account…' : 'Create account'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </RequireGuest>
  );
}
