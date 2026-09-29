import { http } from '@/lib/api';
import type { ApiEnvelope } from '@/types/api';
import type {
  AiSettings,
  DeleteAiKeyResult,
  TestAiKeyInput,
  TestAiKeyResult,
  UpdateAiSettingsInput,
} from '@/features/ai-settings/types';

/**
 * AI settings service (BYOK).
 *
 * - GET    /settings/ai          → safe configuration (no key, ever)
 * - PUT    /settings/ai          → update mode and/or store a Gemini key
 * - POST   /settings/ai/test     → verify a key against Gemini
 * - DELETE /settings/ai/gemini   → remove the stored key
 *
 * The key is only ever an outbound request body. It is not cached by React
 * Query, never written to storage, and not returned by the API.
 */
export async function getAiSettings(): Promise<AiSettings> {
  const { data } = await http.get<ApiEnvelope<AiSettings>>('/settings/ai');

  return data.data;
}

export async function updateAiSettings(
  input: UpdateAiSettingsInput,
): Promise<AiSettings> {
  const { data } = await http.put<ApiEnvelope<AiSettings>>('/settings/ai', input);

  return data.data;
}

export async function testAiKey(
  input: TestAiKeyInput = {},
): Promise<TestAiKeyResult> {
  const { data } = await http.post<ApiEnvelope<TestAiKeyResult>>(
    '/settings/ai/test',
    input,
  );

  return data.data;
}

export async function deleteAiKey(): Promise<DeleteAiKeyResult> {
  const { data } = await http.delete<ApiEnvelope<DeleteAiKeyResult>>(
    '/settings/ai/gemini',
  );

  return data.data;
}
