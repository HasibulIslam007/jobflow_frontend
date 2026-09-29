'use client';

import { useState } from 'react';
import {
  CheckCircle2Icon,
  KeyRoundIcon,
  RefreshCwIcon,
  SparklesIcon,
  Trash2Icon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ErrorState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useAiSettings,
  useDeleteAiKey,
  useTestAiKey,
  useUpdateAiSettings,
} from '@/features/ai-settings/hooks';
import { AI_MODES, AI_MODE_COPY, type AiMode } from '@/features/ai-settings/types';
import { cn } from 'cn';

/**
 * AI Settings — BYOK (Phase 7).
 *
 * SECURITY RULES OBSERVED IN THIS COMPONENT
 * -----------------------------------------
 * · The key lives in component state ONLY while the user is typing, and is
 *   cleared the moment a save settles — never written to localStorage, a
 *   cookie, or a NEXT_PUBLIC_* variable.
 * · The saved key is never rendered. Once stored, the field shows a fixed mask
 *   plus the four-character hint the API is willing to disclose.
 * · The input is `type="password"` with autocomplete off, so a browser will not
 *   suggest a previously used key or expose it on a shared screen.
 */
export function AiSettingsForm() {
  const { data, isPending, isError, error, refetch } = useAiSettings();
  const save = useUpdateAiSettings();
  const test = useTestAiKey();
  const remove = useDeleteAiKey();

  // The user's UNSAVED choice, not a copy of the server value.
  //
  // Holding `data.mode` in state and syncing it with an effect would mean
  // re-deriving state from a prop on every refetch. Instead this starts null
  // ("no choice made") and falls back to the server value, so the radio always
  // shows the truth until the user touches it — and snaps back to the stored
  // value after a successful save.
  const [pendingMode, setPendingMode] = useState<AiMode | null>(null);
  const [draftKey, setDraftKey] = useState('');
  // "Replace Key" flips the masked field back into an editable one.
  const [replacing, setReplacing] = useState(false);

  const configured = data?.configured ?? false;
  const hint = data?.key_hint ?? null;
  const pending = save.isPending || test.isPending || remove.isPending;
  const effectiveMode = pendingMode ?? data?.mode ?? 'automatic';

  function handleSave() {
    save.mutate(
      {
        provider: 'gemini',
        ...(draftKey.trim() ? { api_key: draftKey.trim() } : {}),
        ...(pendingMode ? { mode: pendingMode } : {}),
      },
      {
        // The draft is dropped here, in the mutation's own success callback,
        // rather than in an effect watching `isSuccess`. An effect would also
        // fire for a save triggered elsewhere, and would keep a typed secret
        // alive in the component tree for a frame after it was sent.
        onSuccess: () => {
          setDraftKey('');
          setReplacing(false);
          setPendingMode(null);
        },
      },
    );
  }

  function handleTest() {
    test.mutate(
      draftKey.trim() ? { provider: 'gemini', api_key: draftKey.trim() } : {},
    );
  }

  if (isPending) {
    return (
      <div className="space-y-4" aria-label="Loading AI settings">
        <Skeleton className="h-44 w-full rounded-xl" />
        <Skeleton className="h-56 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <ErrorState
        title="Could not load AI settings"
        description={
          error instanceof Error
            ? error.message
            : 'Something went wrong loading your settings.'
        }
        action={
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCwIcon aria-hidden="true" />
            Try again
          </Button>
        }
      />
    );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SparklesIcon className="size-4 text-ai" aria-hidden="true" />
            AI Provider
          </CardTitle>
          <CardDescription>
            Choose how your AI requests are routed and billed.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <fieldset className="space-y-2">
            <legend className="sr-only">AI provider mode</legend>

            {AI_MODES.map((option) => {
              const copy = AI_MODE_COPY[option];
              const selected = effectiveMode === option;

              return (
                <label
                  key={option}
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors',
                    selected
                      ? 'border-ai/40 bg-ai/[0.05]'
                      : 'border-border hover:border-foreground/20',
                  )}
                >
                  <input
                    type="radio"
                    name="ai-mode"
                    value={option}
                    checked={selected}
                    onChange={() => setPendingMode(option)}
                    disabled={pending}
                    className="mt-0.5 size-4 accent-[var(--ai)]"
                  />
                  <span className="min-w-0">
                    <span className="block text-caption font-medium text-foreground">
                      {copy.title}
                    </span>
                    <span className="mt-0.5 block text-caption text-pretty text-muted-foreground">
                      {copy.description}
                    </span>
                  </span>
                </label>
              );
            })}
          </fieldset>

          {effectiveMode === 'personal' && !configured ? (
            <p className="mt-3 rounded-lg border border-warning/30 bg-warning/5 px-3 py-2 text-caption text-pretty text-muted-foreground">
              Add a Gemini API key below first — there is nothing for
              &ldquo;My Gemini API&rdquo; to use yet.
            </p>
          ) : null}
        </CardContent>
      </Card>


      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRoundIcon className="size-4" aria-hidden="true" />
            Gemini API Key
          </CardTitle>
          <CardDescription>
            Optional. Used only when you ask for it, or when JobFlow AI reaches
            its Gemini limit.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {configured && !replacing ? (
            <div className="space-y-3">
              <Input
                value="••••••••••••••••••"
                readOnly
                disabled
                aria-label="Saved Gemini API key (hidden)"
                className="font-mono"
              />

              <p className="text-caption text-muted-foreground">
                Key ending in{' '}
                <span className="font-mono">{hint ?? '····'}</span>
              </p>

              <p className="flex items-center gap-1.5 text-caption font-medium text-success">
                <CheckCircle2Icon className="size-4" aria-hidden="true" />
                Connected
              </p>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setReplacing(true)}
                  disabled={pending}
                >
                  Replace Key
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => test.mutate({})}
                  disabled={pending}
                >
                  Test Key
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => remove.mutate()}
                  disabled={pending}
                >
                  <Trash2Icon aria-hidden="true" />
                  Remove Key
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="gemini-api-key">Your Gemini API key</Label>
                <Input
                  id="gemini-api-key"
                  type="password"
                  value={draftKey}
                  onChange={(event) => setDraftKey(event.target.value)}
                  placeholder="AIza…"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  disabled={pending}
                />
                <p className="text-micro text-muted-foreground">
                  Stored encrypted against your account. We never display it
                  again after saving.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTest}
                  disabled={pending || !draftKey.trim()}
                >
                  Test Key
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={pending || !draftKey.trim()}
                >
                  Save
                </Button>
                {configured ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setReplacing(false);
                      setDraftKey('');
                    }}
                    disabled={pending}
                  >
                    Cancel
                  </Button>
                ) : null}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

  }
