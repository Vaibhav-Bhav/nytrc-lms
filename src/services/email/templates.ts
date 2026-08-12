// src/services/email/templates.ts

export interface AccountCreatedTemplateInput {
  studentName: string
  email: string
  temporaryPassword?: string
  loginUrl?: string
  expiresInHours?: number
}

export interface PaymentConfirmationTemplateInput {
  studentName: string
  email: string
  courseTitle: string
  amountPaid: number
  invoiceNumber: string
  supportEmail?: string
}

export function renderAccountCreatedEmail(input: AccountCreatedTemplateInput) {
  const loginUrl = input.loginUrl || 'https://lms.nytrc.org/login'
  const tempPasswordBlock = input.temporaryPassword
    ? `
      <div style="background-color: #f1f5f9; border: 1px border-slate-200; border-radius: 8px; padding: 16px; margin: 20px 0; text-align: center;">
        <p style="margin: 0 0 6px 0; font-size: 13px; color: #64748b; font-weight: 600; text-transform: uppercase;">Your Temporary Password</p>
        <p style="margin: 0; font-family: monospace; font-size: 20px; font-weight: 700; color: #0f172a; letter-spacing: 1px;">${input.temporaryPassword}</p>
        <p style="margin: 8px 0 0 0; font-size: 12px; color: #ef4444; font-weight: 500;">Expires in 72 hours. You will be prompted to set a new password upon first login.</p>
      </div>
    `
    : `
      <p style="color: #475569;">Your student account is active. Please use the password set during your registration.</p>
    `

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 20px; }
        .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #e2e8f0; }
        .logo { font-size: 20px; font-weight: 800; color: #4f46e5; margin-bottom: 24px; text-decoration: none; display: inline-block; }
        h1 { font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 16px; }
        p { margin-top: 0; margin-bottom: 16px; font-size: 15px; color: #334155; }
        .button { display: inline-block; background-color: #4f46e5; color: #ffffff; font-weight: 700; font-size: 14px; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 12px; }
        .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">NYTRC LMS</div>
        <h1>Welcome to NYTRC LMS!</h1>
        <p>Dear ${input.studentName || 'Student'},</p>
        <p>Thank you for enrolling! An account has been automatically created for you using your email: <strong>${input.email}</strong>.</p>
        
        ${tempPasswordBlock}

        <p style="text-align: center; margin-top: 24px;">
          <a href="${loginUrl}" class="button" style="color: #ffffff;">Log in to Your Portal</a>
        </p>

        <p style="font-size: 13px; color: #64748b; margin-top: 24px;">If you have any questions or require support, please contact our team.</p>

        <div class="footer">
          <p>© ${new Date().getFullYear()} NYTRC LMS. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  return {
    subject: 'Welcome to NYTRC LMS — Your Account Credentials',
    html,
  }
}

export function renderPaymentConfirmationEmail(input: PaymentConfirmationTemplateInput) {
  const supportEmail = input.supportEmail || 'support@nytrc.org'

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 20px; }
        .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #e2e8f0; }
        .logo { font-size: 20px; font-weight: 800; color: #4f46e5; margin-bottom: 24px; text-decoration: none; display: inline-block; }
        h1 { font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 16px; }
        p { margin-top: 0; margin-bottom: 16px; font-size: 15px; color: #334155; }
        .summary-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0; }
        .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">NYTRC LMS</div>
        <h1>Payment Confirmed & Course Access Granted!</h1>
        <p>Dear ${input.studentName || 'Student'},</p>
        <p>We have successfully received your payment. Your course access is active with lifetime entitlement.</p>
        
        <div class="summary-box">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Course:</td>
              <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #0f172a;">${input.courseTitle}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Invoice Number:</td>
              <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #0f172a;">${input.invoiceNumber}</td>
            </tr>
            <tr style="border-top: 1px solid #e2e8f0;">
              <td style="padding: 10px 0 4px 0; font-weight: 700; color: #0f172a;">Amount Paid:</td>
              <td style="padding: 10px 0 4px 0; font-weight: 800; font-size: 16px; text-align: right; color: #4f46e5;">₹${input.amountPaid.toLocaleString('en-IN')}</td>
            </tr>
          </table>
        </div>

        <p>Your official tax invoice PDF is attached to this email for your records.</p>
        <p>You can access your course anytime by logging into the student portal.</p>

        <div class="footer">
          <p>Need assistance? Contact support at <a href="mailto:${supportEmail}" style="color: #4f46e5;">${supportEmail}</a>.</p>
          <p>© ${new Date().getFullYear()} NYTRC LMS. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  return {
    subject: `Payment Confirmed: ${input.courseTitle}`,
    html,
  }
}

export interface PasswordResetTemplateInput {
  userName: string
  email: string
  resetUrl: string
  expiresInMinutes?: number
}

export function renderPasswordResetEmail(input: PasswordResetTemplateInput) {
  const expiresIn = input.expiresInMinutes || 60

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 20px; }
        .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #e2e8f0; }
        .logo { font-size: 20px; font-weight: 800; color: #4f46e5; margin-bottom: 24px; text-decoration: none; display: inline-block; }
        h1 { font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 16px; }
        p { margin-top: 0; margin-bottom: 16px; font-size: 15px; color: #334155; }
        .button { display: inline-block; background-color: #4f46e5; color: #ffffff; font-weight: 700; font-size: 14px; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 12px; }
        .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">NYTRC LMS</div>
        <h1>Password Reset Request</h1>
        <p>Dear ${input.userName || 'User'},</p>
        <p>We received a request to reset the password for your NYTRC LMS account (<strong>${input.email}</strong>).</p>
        <p>Click the button below to set a new password:</p>

        <p style="text-align: center; margin-top: 24px;">
          <a href="${input.resetUrl}" class="button" style="color: #ffffff;">Reset Your Password</a>
        </p>

        <p style="font-size: 13px; color: #64748b; margin-top: 24px;">
          This link is valid for <strong>${expiresIn} minutes</strong>. If you did not request a password reset, you can safely ignore this email — your password will remain unchanged.
        </p>

        <div class="footer">
          <p>© ${new Date().getFullYear()} NYTRC LMS. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  return {
    subject: 'Password Reset Request — NYTRC LMS',
    html,
  }
}

