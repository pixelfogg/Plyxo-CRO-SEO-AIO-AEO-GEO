import 'server-only'

/**
 * Community Edition: Automations engine stub (no-op).
 */
export async function runAutomationsForEvent(
  orgId: string | null | undefined,
  event: string,
  payload: Record<string, unknown> = {},
): Promise<void> {
  // Automations are disabled / no-op in Community Edition
  return;
}
