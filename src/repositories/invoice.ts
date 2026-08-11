// src/repositories/invoice.ts
//
// Supabase-backed repository for the `invoices` table.

import { supabase } from '@/lib/supabase'
import type { Invoice, NewInvoice } from '@/schemas/invoices'

function toInvoice(row: Record<string, unknown>): Invoice {
  return {
    id: row.id as string,
    payment_id: row.payment_id as string,
    invoice_number: row.invoice_number as string,
    invoice_date: (row.invoice_date as string | null) ?? undefined,
    invoice_status: row.invoice_status as 'pending' | 'generated',
    invoice_download_url: (row.invoice_download_url as string | null) ?? null,
    seller_name: (row.seller_name as string | null) ?? undefined,
    seller_gstin: (row.seller_gstin as string | null) ?? undefined,
    buyer_state: (row.buyer_state as string | null) ?? undefined,
    place_of_supply: (row.place_of_supply as string | null) ?? undefined,
    sac_code: (row.sac_code as string | null) ?? undefined,
    tax_type: (row.tax_type as 'cgst_sgst' | 'igst' | null) ?? undefined,
    base_amount: Number(row.base_amount),
    gst_amount: Number(row.gst_amount),
    gst_rate: Number(row.gst_rate),
    cgst: row.cgst !== undefined ? Number(row.cgst) : undefined,
    sgst: row.sgst !== undefined ? Number(row.sgst) : undefined,
    igst: row.igst !== undefined ? Number(row.igst) : undefined,
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
        invoice_date: data.invoice_date ?? new Date().toISOString(),
        invoice_status: data.invoice_status ?? 'generated',
        seller_name: data.seller_name ?? null,
        seller_gstin: data.seller_gstin ?? null,
        buyer_state: data.buyer_state ?? null,
        place_of_supply: data.place_of_supply ?? null,
        sac_code: data.sac_code ?? null,
        tax_type: data.tax_type ?? null,
        base_amount: data.base_amount,
        gst_amount: data.gst_amount,
        gst_rate: data.gst_rate,
        cgst: data.cgst ?? 0,
        sgst: data.sgst ?? 0,
        igst: data.igst ?? 0,
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
