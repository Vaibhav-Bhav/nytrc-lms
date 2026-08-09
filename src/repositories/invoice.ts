// src/repositories/invoice.ts
//
// Supabase-backed repository for the `invoices` table.
//
// Public method signatures are identical to the in-memory version so that
// services/payment.ts requires zero changes.
//
// Expected Supabase table DDL (run once in Supabase SQL editor):
//
//   create table public.invoices (
//     id                    uuid primary key default gen_random_uuid(),
//     payment_id            uuid not null unique references public.payments(id),
//     invoice_number        text not null unique,
//     invoice_status        text not null default 'generated'
//                             check (invoice_status in ('pending','generated')),
//     invoice_download_url  text,
//     base_amount           numeric(10,2) not null,
//     gst_amount            numeric(10,2) not null,
//     gst_rate              numeric(5,4) not null,
//     total_amount          numeric(10,2) not null,
//     created_at            timestamptz not null default now(),
//     updated_at            timestamptz not null default now()
//   );
//
//   -- After creating invoices, add the FK from payments back to invoices:
//   alter table public.payments
//     add constraint payments_invoice_id_fkey
//     foreign key (invoice_id) references public.invoices(id);

import { supabase } from '@/lib/supabase'
import type { Invoice, NewInvoice } from '@/schemas/invoices'

// -----------------------------------------------------------------------
// Internal helper — maps a raw Supabase row to the Invoice type.
// Numeric columns are coerced with Number() because Postgres numeric types
// may be returned as strings by the PostgREST layer.
// -----------------------------------------------------------------------
function toInvoice(row: Record<string, unknown>): Invoice {
  return {
    id: row.id as string,
    payment_id: row.payment_id as string,
    invoice_number: row.invoice_number as string,
    invoice_status: row.invoice_status as 'pending' | 'generated',
    invoice_download_url: (row.invoice_download_url as string | null) ?? null,
    base_amount: Number(row.base_amount),
    gst_amount: Number(row.gst_amount),
    gst_rate: Number(row.gst_rate),
    total_amount: Number(row.total_amount),
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  }
}

export const invoiceRepository = {
  async findAll(): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) throw new Error(`invoiceRepository.findAll: ${error.message}`)
    return (data ?? []).map(toInvoice)
  },

  async findById(id: string): Promise<Invoice | null> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) throw new Error(`invoiceRepository.findById: ${error.message}`)
    return data ? toInvoice(data) : null
  },

  // The UNIQUE constraint on payment_id means at most one invoice per payment.
  async findByPaymentId(paymentId: string): Promise<Invoice | null> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('payment_id', paymentId)
      .maybeSingle()

    if (error) throw new Error(`invoiceRepository.findByPaymentId: ${error.message}`)
    return data ? toInvoice(data) : null
  },

  async findByInvoiceNumber(invoiceNumber: string): Promise<Invoice | null> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('invoice_number', invoiceNumber)
      .maybeSingle()

    if (error) throw new Error(`invoiceRepository.findByInvoiceNumber: ${error.message}`)
    return data ? toInvoice(data) : null
  },

  async findLatest(): Promise<Invoice | null> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) throw new Error(`invoiceRepository.findLatest: ${error.message}`)
    return data ? toInvoice(data) : null
  },

  async create(data: NewInvoice): Promise<Invoice> {
    const { data: row, error } = await supabase
      .from('invoices')
      .insert({
        payment_id: data.payment_id,
        invoice_number: data.invoice_number,
        invoice_status: data.invoice_status ?? 'generated',
        base_amount: data.base_amount,
        gst_amount: data.gst_amount,
        gst_rate: data.gst_rate,
        total_amount: data.total_amount,
      })
      .select()
      .single()

    if (error) throw new Error(`invoiceRepository.create: ${error.message}`)
    return toInvoice(row)
  },

  async updateDownloadUrl(id: string, url: string): Promise<Invoice | null> {
    const { data: row, error } = await supabase
      .from('invoices')
      .update({
        invoice_download_url: url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .maybeSingle()

    if (error) throw new Error(`invoiceRepository.updateDownloadUrl: ${error.message}`)
    return row ? toInvoice(row) : null
  },

  async remove(id: string): Promise<boolean> {
    const { error, count } = await supabase
      .from('invoices')
      .delete({ count: 'exact' })
      .eq('id', id)

    if (error) throw new Error(`invoiceRepository.remove: ${error.message}`)
    return (count ?? 0) > 0
  },
}
