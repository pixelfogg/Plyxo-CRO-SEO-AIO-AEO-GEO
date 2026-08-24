import 'server-only'
import nodemailer from 'nodemailer'

/**
 * SMTP mailer, gated by env. When SMTP is not configured, `isEmailConfigured()`
 * is false and callers fall back to showing a copyable invite link instead of
 * sending an email — so the invite flow works with or without SMTP.
 *
 * Required env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 * Optional: SMTP_SECURE ("true" for port 465), NEXT_PUBLIC_APP_URL
 */

export function isEmailConfigured(): boolean {
  return !!(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_FROM)
}

let transporter: nodemailer.Transporter | null = null
function getTransporter(): nodemailer.Transporter {
  if (transporter) return transporter
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  })
  return transporter
}

export type SendResult = { sent: boolean; error?: string }

export async function sendMail(to: string, subject: string, html: string, text?: string): Promise<SendResult> {
  if (!isEmailConfigured()) return { sent: false, error: 'SMTP not configured' }
  try {
    await getTransporter().sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      text: text ?? html.replace(/<[^>]+>/g, ' '),
      html,
    })
    return { sent: true }
  } catch (err: any) {
    console.error('[Mailer] sendMail failed:', err)
    return { sent: false, error: err?.message || 'Failed to send email' }
  }
}

/** Base URL for building links in emails. */
export function appUrl(path = ''): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return `${base.replace(/\/$/, '')}${path}`
}
