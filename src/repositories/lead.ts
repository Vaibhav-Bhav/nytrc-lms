// src/repositories/lead.ts
//
// Supabase-backed repository for the `leads` table.

import { supabase } from '@/lib/supabase'
import type { Lead, NewLead, UpdateLead } from '@/schemas/leads'

function toLead(row: Record<string, unknown>): Lead {
  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    mobile: (row.mobile as string | null) ?? null,
    state: (row.state as string | null) ?? null,
    course_id: (row.course_id as string | null) ?? null,
    razorpay_order_id: (row.razorpay_order_id as string | null) ?? null,
    status: row.status as 'initiated' | 'paid' | 'failed',
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  }
}

export const leadRepository = {
  async findAll(): Promise<Lead[]> {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw new Error(`leadRepository.findAll: ${error.message}`)
    return (data ?? []).map(toLead)
  },

  async findById(id: string): Promise<Lead | null> {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) throw new Error(`leadRepository.findById: ${error.message}`)
    return data ? toLead(data) : null
  },

  async findByEmail(email: string): Promise<Lead[]> {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .ilike('email', email)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`leadRepository.findByEmail: ${error.message}`)
    return (data ?? []).map(toLead)
  },

  async findByRazorpayOrderId(orderId: string): Promise<Lead | null> {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('razorpay_order_id', orderId)
      .maybeSingle()

    if (error) throw new Error(`leadRepository.findByRazorpayOrderId: ${error.message}`)
    return data ? toLead(data) : null
  },

  async create(data: NewLead): Promise<Lead> {
    const { data: row, error } = await supabase
      .from('leads')
      .insert({
        name: data.name,
        email: data.email,
        mobile: data.mobile ?? null,
        state: data.state ?? null,
        course_id: data.course_id ?? null,
        razorpay_order_id: data.razorpay_order_id ?? null,
        status: data.status ?? 'initiated',
      })
      .select()
      .single()

    if (error) throw new Error(`leadRepository.create: ${error.message}`)
    return toLead(row)
  },

  async update(id: string, data: UpdateLead): Promise<Lead | null> {
    const { data: row, error } = await supabase
      .from('leads')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .maybeSingle()

    if (error) throw new Error(`leadRepository.update: ${error.message}`)
    return row ? toLead(row) : null
  },

  async remove(id: string): Promise<boolean> {
    const { error, count } = await supabase
      .from('leads')
      .delete({ count: 'exact' })
      .eq('id', id)

    if (error) throw new Error(`leadRepository.remove: ${error.message}`)
    return (count ?? 0) > 0
  },
}
