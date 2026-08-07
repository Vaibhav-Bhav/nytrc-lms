// src/repositories/invoice.ts
//
// TEMPORARY: in-memory store. Swap the internals of each function for
// Supabase queries once credentials land — keep these exact function
// signatures.

import type { Invoice, NewInvoice } from '@/schemas/invoices'

let invoices: Invoice[] = []

function generateId(): string {
  return crypto.randomUUID()
}

export const invoiceRepository = {
  async findAll(): Promise<Invoice[]> {
    return invoices
  },

  async findById(id: string): Promise<Invoice | null> {
    return invoices.find((i) => i.id === id) ?? null
  },

  async findByPaymentId(paymentId: string): Promise<Invoice | null> {
    return invoices.find((i) => i.payment_id === paymentId) ?? null
  },

  async findByInvoiceNumber(invoiceNumber: string): Promise<Invoice | null> {
    return invoices.find((i) => i.invoice_number === invoiceNumber) ?? null
  },

  async create(data: NewInvoice): Promise<Invoice> {
    const now = new Date().toISOString()
    const invoice: Invoice = {
      id: generateId(),
      payment_id: data.payment_id,
      invoice_number: data.invoice_number,
      invoice_status: data.invoice_status ?? 'generated',
      invoice_download_url: null,
      base_amount: data.base_amount,
      gst_amount: data.gst_amount,
      gst_rate: data.gst_rate,
      total_amount: data.total_amount,
      created_at: now,
      updated_at: now,
    }
    invoices.push(invoice)
    return invoice
  },

  async updateDownloadUrl(id: string, url: string): Promise<Invoice | null> {
    const idx = invoices.findIndex((i) => i.id === id)
    if (idx === -1) return null

    invoices[idx] = {
      ...invoices[idx],
      invoice_download_url: url,
      updated_at: new Date().toISOString(),
    }
    return invoices[idx]
  },

  async remove(id: string): Promise<boolean> {
    const before = invoices.length
    invoices = invoices.filter((i) => i.id !== id)
    return invoices.length < before
  },
}
