// src/lib/resend.ts
//
// Integration helper for the Resend REST API.
// Works natively with fetch to avoid package dependencies.
//

function getRequiredEnv(key: string): string {
  const value = process.env[key]
  if (!value || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value.trim()
}

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const apiKey = process.env['RESEND_API_KEY']?.trim()
  if (!apiKey) {
    console.warn(`[Resend] Skipping email notification to ${to}: RESEND_API_KEY is not configured.`)
    return
  }
  const from = process.env['RESEND_FROM_EMAIL'] || 'onboarding@resend.dev'

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Resend API error [${response.status}]: ${errorText}`)
  }
}
