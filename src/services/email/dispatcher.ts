// src/services/email/dispatcher.ts

import { emailLogRepository } from '@/repositories/emailLog'
import { ResendEmailProvider } from './resend'
import {
  renderAccountCreatedEmail,
  renderPaymentConfirmationEmail,
  type AccountCreatedTemplateInput,
  type PaymentConfirmationTemplateInput,
} from './templates'
import type { EmailAttachment } from './provider'

const provider = new ResendEmailProvider()

export const emailDispatcher = {
  /**
   * Dispatches the new student account creation email containing temporary credentials.
   * Ensures idempotency so duplicate calls do not send multiple welcome emails.
   */
  async sendAccountCreatedEmail(
    userId: string,
    input: AccountCreatedTemplateInput,
  ): Promise<{ success: boolean; logId?: string; error?: string }> {
    // 1. Idempotency Check: check if welcome email was already sent to this user
    try {
      const existingLogs = await emailLogRepository.findByUserId(userId)
      const alreadySent = existingLogs.find(
        (log) => log.template === 'account_created' && (log.status === 'sent' || log.status === 'delivered'),
      )
      if (alreadySent) {
        console.log(`[emailDispatcher] Account created email already sent to ${input.email} (log ID: ${alreadySent.id}). Bypassing.`)
        return { success: true, logId: alreadySent.id }
      }
    } catch (e) {
      console.warn('[emailDispatcher] Could not query email_log for idempotency check:', e)
    }

    const { subject, html } = renderAccountCreatedEmail(input)

    // 2. Create pending log record (Note: Plaintext password is NEVER stored in metadata or logs)
    let logRecord
    try {
      logRecord = await emailLogRepository.create({
        user_id: userId,
        template: 'account_created',
        to_address: input.email,
        subject,
        status: 'pending',
        metadata: { student_name: input.studentName, login_url: input.loginUrl },
      })
    } catch (dbErr) {
      console.error('[emailDispatcher] Failed to create pending email_log record:', dbErr)
    }

    // 3. Send email through provider
    try {
      const result = await provider.send({
        to: input.email,
        subject,
        html,
      })

      if (result.success && logRecord) {
        await emailLogRepository.updateStatus(logRecord.id, 'sent', result.messageId)
        console.log(`[emailDispatcher] Account created email sent successfully to ${input.email} (Msg ID: ${result.messageId})`)
        return { success: true, logId: logRecord.id }
      } else {
        if (logRecord) {
          await emailLogRepository.updateStatus(logRecord.id, 'failed', undefined, result.error)
        }
        console.error(`[emailDispatcher] Account created email failed for ${input.email}:`, result.error)
        return { success: false, logId: logRecord?.id, error: result.error }
      }
    } catch (err: any) {
      console.error(`[emailDispatcher] Exception during account created email dispatch to ${input.email}:`, err)
      if (logRecord) {
        await emailLogRepository.updateStatus(logRecord.id, 'failed', undefined, err.message)
      }
      return { success: false, logId: logRecord?.id, error: err.message }
    }
  },

  /**
   * Dispatches the payment confirmation email with the GST invoice PDF attachment.
   * Ensures idempotency so webhooks do not trigger duplicate payment emails.
   */
  async sendPaymentConfirmationEmail(
    userId: string,
    input: PaymentConfirmationTemplateInput,
    pdfAttachment?: { filename: string; content: Buffer },
  ): Promise<{ success: boolean; logId?: string; error?: string }> {
    // 1. Idempotency Check: check if payment confirmation was already sent for this invoice number
    try {
      const existingLogs = await emailLogRepository.findAll()
      const alreadySent = existingLogs.find(
        (log) =>
          log.template === 'payment_confirmation' &&
          (log.status === 'sent' || log.status === 'delivered') &&
          ((log.metadata as any)?.invoice_number === input.invoiceNumber || log.subject?.includes(input.invoiceNumber)),
      )
      if (alreadySent) {
        console.log(`[emailDispatcher] Payment confirmation email already sent for invoice ${input.invoiceNumber}. Bypassing.`)
        return { success: true, logId: alreadySent.id }
      }
    } catch (e) {
      console.warn('[emailDispatcher] Could not query email_log for payment confirmation idempotency check:', e)
    }

    const { subject, html } = renderPaymentConfirmationEmail(input)

    const attachments: EmailAttachment[] = []
    if (pdfAttachment) {
      attachments.push({
        filename: pdfAttachment.filename,
        content: pdfAttachment.content,
        contentType: 'application/pdf',
      })
    }

    // 2. Create pending log record
    let logRecord
    try {
      logRecord = await emailLogRepository.create({
        user_id: userId,
        template: 'payment_confirmation',
        to_address: input.email,
        subject,
        status: 'pending',
        metadata: {
          course_title: input.courseTitle,
          amount_paid: input.amountPaid,
          invoice_number: input.invoiceNumber,
          has_pdf_attachment: !!pdfAttachment,
        },
      })
    } catch (dbErr) {
      console.error('[emailDispatcher] Failed to create pending email_log record:', dbErr)
    }

    // 3. Send email through provider
    try {
      const result = await provider.send({
        to: input.email,
        subject,
        html,
        attachments,
      })

      if (result.success && logRecord) {
        await emailLogRepository.updateStatus(logRecord.id, 'sent', result.messageId)
        console.log(`[emailDispatcher] Payment confirmation email sent successfully for invoice ${input.invoiceNumber} to ${input.email}`)
        return { success: true, logId: logRecord.id }
      } else {
        if (logRecord) {
          await emailLogRepository.updateStatus(logRecord.id, 'failed', undefined, result.error)
        }
        console.error(`[emailDispatcher] Payment confirmation email failed for invoice ${input.invoiceNumber}:`, result.error)
        return { success: false, logId: logRecord?.id, error: result.error }
      }
    } catch (err: any) {
      console.error(`[emailDispatcher] Exception during payment confirmation dispatch:`, err)
      if (logRecord) {
        await emailLogRepository.updateStatus(logRecord.id, 'failed', undefined, err.message)
      }
      return { success: false, logId: logRecord?.id, error: err.message }
    }
  },

  /**
   * Resends a previously logged email by ID. Used by the Admin Email Log UI.
   * Never exposes sensitive temporary passwords.
   */
  async resendLogById(logId: string): Promise<{ success: boolean; error?: string }> {
    const log = await emailLogRepository.findById(logId)
    if (!log) {
      return { success: false, error: 'LOG_NOT_FOUND' }
    }

    const result = await provider.send({
      to: log.to_address,
      subject: log.subject || 'NYTRC LMS Notification',
      html: `<p>Resent notification: ${log.template}</p><p>Please log in to your student portal for latest account updates.</p>`,
    })

    if (result.success) {
      await emailLogRepository.updateStatus(log.id, 'sent', result.messageId)
      return { success: true }
    } else {
      await emailLogRepository.updateStatus(log.id, 'failed', undefined, result.error)
      return { success: false, error: result.error }
    }
  },
}
