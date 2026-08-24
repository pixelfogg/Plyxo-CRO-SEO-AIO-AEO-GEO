'use server'

import { db } from '@/db'
import { apiKeys, webhooks } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'
import { logActivity } from '@/lib/audit'
import { requireProjectAccess } from '@/lib/auth'
import { assertUrlAllowed } from '@/lib/security'

export async function getDeveloperData(projectId: string) {
  try {
    await requireProjectAccess(projectId)
    const keys = await db.query.apiKeys.findMany({
      where: eq(apiKeys.projectId, projectId)
    })
    const hooks = await db.query.webhooks.findMany({
      where: eq(webhooks.projectId, projectId)
    })
    return { success: true, apiKeys: keys, webhooks: hooks }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function generateApiKey(projectId: string, name: string) {
  try {
    await requireProjectAccess(projectId)

    const token = crypto.randomBytes(32).toString('hex')
    const keyString = `plyxo_${token}`
    const keyHash = crypto.createHash('sha256').update(keyString).digest('hex')

    const [newKey] = await db.insert(apiKeys).values({
      projectId,
      name,
      keyHash
    }).returning()

    await logActivity('Generated API Key', name, 'success', undefined, projectId);

    revalidatePath(`/dashboard/projects/${projectId}/developer`)

    // Return the unhashed key ONLY ONCE
    return { success: true, key: newKey, rawKey: keyString }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function revokeApiKey(keyId: string, projectId: string) {
  try {
    await requireProjectAccess(projectId)
    await db.delete(apiKeys).where(and(eq(apiKeys.id, keyId), eq(apiKeys.projectId, projectId)))

    await logActivity('Revoked API Key', 'Key ID: ' + keyId, 'success', undefined, projectId);

    revalidatePath(`/dashboard/projects/${projectId}/developer`)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function createWebhook(projectId: string, name: string, url: string, secret?: string) {
  try {
    await requireProjectAccess(projectId)
    await db.insert(webhooks).values({
      projectId,
      name,
      url,
      secret: secret || null,
      events: ["scan.completed"], // Hardcoded for now
      isActive: true
    })

    await logActivity('Created Webhook', name, 'success', undefined, projectId);

    revalidatePath(`/dashboard/projects/${projectId}/developer`)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteWebhook(hookId: string, projectId: string) {
  try {
    await requireProjectAccess(projectId)
    await db.delete(webhooks).where(and(eq(webhooks.id, hookId), eq(webhooks.projectId, projectId)))

    await logActivity('Deleted Webhook', 'Webhook ID: ' + hookId, 'success', undefined, projectId);

    revalidatePath(`/dashboard/projects/${projectId}/developer`)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function testWebhook(hookId: string, projectId: string) {
  try {
    await requireProjectAccess(projectId)
    const hook = await db.query.webhooks.findFirst({
      where: and(eq(webhooks.id, hookId), eq(webhooks.projectId, projectId))
    })
    if (!hook) throw new Error("Webhook not found")

    const payload = {
      event: "ping",
      projectId,
      message: "This is a test ping from Plyxo Intelligence",
      timestamp: new Date().toISOString()
    };
    const body = JSON.stringify(payload);

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    // Sign the body with an HMAC — never transmit the raw secret.
    if (hook.secret) {
      headers["X-Plyxo-Signature"] = crypto.createHmac('sha256', hook.secret).update(body).digest('hex');
    }

    const safeHookUrl = await assertUrlAllowed(hook.url);
    const res = await fetch(safeHookUrl, {
      method: "POST",
      headers,
      body
    })

    if (!res.ok) throw new Error(`HTTP Error ${res.status}`)

    await logActivity('Tested Webhook', hook.name, 'success', undefined, projectId);

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
