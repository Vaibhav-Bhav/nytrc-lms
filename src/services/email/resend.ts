// src/services/email/resend.ts

import type { EmailProvider, SendEmailOptions, SendEmailResult } from './provider'

export class ResendEmailProvider implements EmailProvider {
  private apiKey: string | null
  private fromEmail: string

  constructor() {
    const key = process.env['RESEND_API_KEY']
    this.apiKey = key && key.trim() !== '' ? key.trim() : null
    this.fromEmail = process.env['EMAIL_FROM'] || process.env['RESEND_FROM_EMAIL'] || 'NYTRC LMS <onboarding@resend.dev>'
  }

  async send(options: SendEmailOptions): Promise<SendEmailResult> {
    if (!this.apiKey) {
      console.warn('[ResendEmailProvider] Missing RESEND_API_KEY environment variable.')
      return {
        success: false,
        error: 'Missing required environment variable: RESEND_API_KEY',
      }
    }

    try {
      const formattedAttachments = options.attachments?.map((att) => ({
        filename: att.filename,
        content: typeof att.content === 'string'
          ? Buffer.from(att.content).toString('base64')
          : att.content.toString('base64'),
      }))

      const payload: Record<string, unknown> = {
        from: this.fromEmail,
        to: [options.to],
        subject: options.subject,
        html: options.html,
      }

      if (options.text) {
        payload['text'] = options.text
      }

      if (formattedAttachments && formattedAttachments.length > 0) {
        payload['attachments'] = formattedAttachments
      }

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`[ResendEmailProvider] API Error [${response.status}]: ${errorText}`)
        return {
          success: false,
          error: `Resend API Error [${response.status}]: ${errorText}`,
        }
      }

      const data = await response.json()
      return {
        success: true,
        messageId: data.id,
      }
    } catch (err: any) {
      console.error('[ResendEmailProvider] Unexpected error sending email:', err)
      return {
        success: false,
        error: err.message || 'Network failure when connecting to Resend API',
      }
    }
  }
}
