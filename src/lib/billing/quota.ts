import 'server-only'

/**
 * Community Edition: Unlimited local project creation.
 */
export async function assertProjectAllowed(orgId: string | null | undefined): Promise<void> {
  // Community Edition has unlimited projects in local mode
  return;
}

/**
 * Community Edition: Unlimited local scanning and AI analysis.
 */
export async function assertScanAllowed(orgId: string | null | undefined): Promise<void> {
  // Community Edition has unlimited scans in local mode
  return;
}
