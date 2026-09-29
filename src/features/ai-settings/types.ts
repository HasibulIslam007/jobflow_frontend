/**
 * AI settings domain types. Mirror GET/PUT /api/v1/settings/ai exactly.
 *
 * SECURITY: this file contains no field capable of holding an API key. The
 * backend never returns one, so there is nothing here to leak into React
 * state, a devtools panel, or a Redux/Zustand persist store. The only trace
 * of a saved key that reaches the client is `key_hint` — four characters.
 */

export const AI_MODES = ['automatic', 'jobflow', 'personal'] as const;

export type AiMode = (typeof AI_MODES)[number];

export const AI_PROVIDERS = ['gemini'] as const;

export type AiProvider = (typeof AI_PROVIDERS)[number];

export type ProviderSettings = {
  configured: boolean;
  enabled: boolean;
  /** Last four characters, or null when no key is saved. */
  key_hint: string | null;
};

/** GET /api/v1/settings/ai */
export type AiSettings = {
  mode: AiMode;
  provider: AiProvider;
  configured: boolean;
  enabled: boolean;
  key_hint: string | null;
  providers: Record<AiProvider, ProviderSettings>;
};

/**
 * PUT /api/v1/settings/ai body.
 *
 * `api_key` is write-only: it travels to the API and is never read back. The
 * hook clears the draft from state as soon as the mutation settles, so an
 * unsaved key does not linger in the component tree.
 */
export type UpdateAiSettingsInput = {
  mode?: AiMode;
  provider?: AiProvider;
  api_key?: string | null;
};

/** POST /api/v1/settings/ai/test → the supplied key is optional. */
export type TestAiKeyInput = {
  provider?: AiProvider;
  api_key?: string;
};

export type TestAiKeyResult = {
  valid: boolean;
  provider: string;
};

/** DELETE /api/v1/settings/ai/gemini */
export type DeleteAiKeyResult = {
  message: string;
  removed: boolean;
  settings: AiSettings;
};

/** Copy for each mode, kept beside the type so the two cannot drift. */
export const AI_MODE_COPY: Record<
  AiMode,
  { title: string; description: string }
> = {
  automatic: {
    title: 'Automatic',
    description:
      'Use JobFlow AI first and your Gemini API when JobFlow reaches its limit.',
  },
  jobflow: {
    title: 'JobFlow AI',
    description: "Always use JobFlow's AI quota.",
  },
  personal: {
    title: 'My Gemini API',
    description: "Use your own Gemini API quota.",
  },
};
