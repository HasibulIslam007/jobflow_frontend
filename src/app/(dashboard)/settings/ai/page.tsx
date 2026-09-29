'use client';

import { FadeIn } from '@/components/ui/motion';
import { PageHeader } from '@/components/ui/page-header';
import { AiSettingsForm } from '@/features/ai-settings/components/ai-settings-form';

/**
 * /settings/ai — Bring Your Own Gemini API Key.
 *
 * Rendered inside the standard dashboard shell, so it inherits the same auth
 * guard, spacing and page-header rhythm as every other workspace screen. No
 * bespoke chrome.
 */
export default function AiSettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Settings"
        title="AI Settings"
        description="Use your own Gemini API key, or rely on JobFlow's shared quota."
      />

      <FadeIn className="max-w-2xl">
        <AiSettingsForm />
      </FadeIn>
    </div>
  );
}
