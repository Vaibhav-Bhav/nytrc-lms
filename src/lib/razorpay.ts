// src/lib/razorpay.ts
//
// Razorpay integration layer.
// All credentials are read from environment variables only.
// No secrets are hardcoded.
//
// Supports both Test and Live modes through RAZORPAY_MODE env variable.
// The same codebase works on local development, Render, and DigitalOcean
// without any code changes — only environment variable values differ.

import { createHmac } from 'crypto'

// -----------------------------------------------------------------------
// Environment validation
// -----------------------------------------------------------------------

function getRequiredEnv(key: string): string {
  const value = process.env[key]
  if (!value || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value.trim()
}

export function getRazorpayConfig() {
  return {
    keyId: getRequiredEnv('RAZORPAY_KEY_ID'),
    keySecret: getRequiredEnv('RAZORPAY_KEY_SECRET'),
    webhookSecret: getRequiredEnv('RAZORPAY_WEBHOOK_SECRET'),
    mode: (process.env['RAZORPAY_MODE'] ?? 'test') as 'test' | 'live',
  }
}

// -----------------------------------------------------------------------
// Razorpay REST API client (no npm package required)
// Uses native fetch, works on Node 18+ (Nitro / TanStack Start)
// -----------------------------------------------------------------------

const RAZORPAY_BASE_URL = 'https://api.razorpay.com/v1'

type RazorpayOrderCreateParams = {
  amount: number       // in smallest currency unit (paise for INR)
  currency: string     // e.g. 'INR'
  receipt: string      // unique receipt ID, max 40 chars
  notes?: Record<string, string>
}

export type RazorpayOrder = {
  id: string
  entity: 'order'
  amount: number
  amount_paid: number
  amount_due: number
  currency: string
  receipt: string
  status: 'created' | 'attempted' | 'paid'
  notes: Record<string, string>
  created_at: number
}

type RazorpayPaymentDetails = {
  id: string
  entity: 'payment'
  order_id: string
  status: 'authorized' | 'captured' | 'failed' | 'refunded'
  amount: number
  currency: string
  email: string
  contact: string
  created_at: number
}

async function razorpayRequest<T>(
  method: 'GET' | 'POST',
  path: string,
  body?: unknown,
): Promise<T> {
  const config = getRazorpayConfig()

  // Basic auth: base64(keyId:keySecret)
  const credentials = Buffer.from(`${config.keyId}:${config.keySecret}`).toString('base64')

  const response = await fetch(`${RAZORPAY_BASE_URL}${path}`, {
    method,
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
    body: body != null ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Razorpay API error [${response.status}]: ${errorText}`)
  }

  return response.json() as Promise<T>
}

// -----------------------------------------------------------------------
// Order creation
// -----------------------------------------------------------------------

/**
 * Creates a Razorpay order.
 * @param amountInPaise  Amount in smallest unit (1 INR = 100 paise)
 * @param currency       Currency code, defaults to 'INR'
 * @param receipt        Unique receipt identifier (max 40 chars)
 * @param notes          Optional key-value metadata visible on Razorpay dashboard
 */
export async function createRazorpayOrder(
  amountInPaise: number,
  currency = 'INR',
  receipt: string,
  notes?: Record<string, string>,
): Promise<RazorpayOrder> {
  const params: RazorpayOrderCreateParams = {
    amount: amountInPaise,
    currency,
    receipt,
    notes,
  }
  return razorpayRequest<RazorpayOrder>('POST', '/orders', params)
}

// -----------------------------------------------------------------------
// Payment signature verification (POST /api/payments/verify)
// -----------------------------------------------------------------------

/**
 * Verifies a Razorpay payment signature on the server side.
 * Must be called BEFORE granting access or generating an invoice.
 *
 * Razorpay computes HMAC-SHA256 over:
 *   razorpay_order_id + "|" + razorpay_payment_id
 * using RAZORPAY_KEY_SECRET as the HMAC key.
 *
 * @returns true if the signature is valid, false otherwise
 */
export function verifyRazorpaySignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
): boolean {
  const config = getRazorpayConfig()
  const payload = `${razorpayOrderId}|${razorpayPaymentId}`
  const expectedSignature = createHmac('sha256', config.keySecret)
    .update(payload)
    .digest('hex')
  return expectedSignature === razorpaySignature
}

// -----------------------------------------------------------------------
// Webhook signature verification (POST /api/payments/webhook)
// -----------------------------------------------------------------------

/**
 * Verifies the X-Razorpay-Signature header for incoming webhooks.
 * Computes HMAC-SHA256 over the raw request body using RAZORPAY_WEBHOOK_SECRET.
 *
 * IMPORTANT: rawBody must be the exact bytes received — do not JSON.parse
 * and re-serialize, as whitespace differences will break the signature.
 *
 * @returns true if the signature is valid, false otherwise
 */
export function verifyRazorpayWebhookSignature(rawBody: string, signature: string): boolean {
  const config = getRazorpayConfig()
  const expectedSignature = createHmac('sha256', config.webhookSecret)
    .update(rawBody)
    .digest('hex')
  return expectedSignature === signature
}

// -----------------------------------------------------------------------
// Webhook event types supported by this application
// -----------------------------------------------------------------------

export type RazorpayWebhookEvent = {
  entity: 'event'
  event: string
  payload: {
    payment?: {
      entity: RazorpayPaymentDetails
    }
  }
  created_at: number
}
