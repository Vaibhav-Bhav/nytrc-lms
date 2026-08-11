// src/repositories/emailLog.ts
//
// Supabase-backed repository for the `email_log` table.

import { supabase } from '@/lib/supabase'
import type { EmailLog, NewEmailLog, UpdateEmailLog } from '@/schemas/emailLog'

function toEmailLog(row: Record<string, unknown>): EmailLog {
  return {
    id: row.id as string,
    user_id: (row.user_id as string | null) ?? null,
    template: row.template as string,
    to_address: row.to_address as string,
    subject: (row.subject as string | null) ?? null,
    status: row.status as 'pending' | 'sent' | 'failed' | 'delivered',
    provider_message_id: (row.provider_message_id as string | null) ?? null,
    error: (row.error as string | null) ?? null,
    metadata: row.metadata ?? null,
    sent_at: (row.sent_at as string | null) ?? null,
    created_at: row.created_at as string,
  }
}

export const emailLogRepository = {
  async findAll(): Promise<EmailLog[]> {
    const { data, error } = await supabase
      .from('email_log')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw new Error(`emailLogRepository.findAll: ${error.message}`)
    return (data ?? []).map(toEmailLog)
  },

  async findById(id: string): Promise<EmailLog | null> {
    const { data, error } = await supabase
      .from('email_log')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) throw new Error(`emailLogRepository.findById: ${error.message}`)
    return data ? toEmailLog(data) : null
  },

  async findByUserId(userId: string): Promise<EmailLog[]> {
    const { data, error } = await supabase
      .from('email_log')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`emailLogRepository.findByUserId: ${error.message}`)
    return (data ?? []).map(toEmailLog)
  },

  async create(data: NewEmailLog): Promise<EmailLog> {
    const { data: row, error } = await supabase
      .from('email_log')
      .insert({
        user_id: data.user_id ?? null,
        template: data.template,
        to_address: data.to_address,
        subject: data.subject ?? null,
        status: data.status ?? 'pending',
        provider_message_id: data.provider_message_id ?? null,
        error: data.error ?? null,
        metadata: data.metadata ?? null,
        sent_at: data.sent_at ?? null,
      })
      .select()
      .single()

    if (error) throw new Error(`emailLogRepository.create: ${error.message}`)
    return toEmailLog(row)
  },

  async update(id: string, data: UpdateEmailLog): Promise<EmailLog | null> {
    const { data: row, error } = await supabase
      .from('email_log')
      .update(data)
      .eq('id', id)
      .select()
      .maybeSingle()

    if (error) throw new Error(`emailLogRepository.update: ${error.message}`)
    return row ? toEmailLog(row) : null
  },

  async updateStatus(id: string, status: 'pending' | 'sent' | 'failed' | 'delivered', providerMessageId?: string, errorMsg?: string): Promise<EmailLog | null> {
    const updateData: Record<string, unknown> = { status }
    if (status === 'sent' || status === 'delivered') {
      updateData['sent_at'] = new Date().toISOString()
    }
    if (providerMessageId) {
      updateData['provider_message_id'] = providerMessageId
    }
    if (errorMsg !== undefined) {
      updateData['error'] = errorMsg
    }

    const { data: row, error } = await supabase
      .from('email_log')
      .update(updateData)
      .eq('id', id)
      .select()
      .maybeSingle()

    if (error) throw new Error(`emailLogRepository.updateStatus: ${error.message}`)
    return row ? toEmailLog(row) : null
  },

  async remove(id: string): Promise<boolean> {
    const { error, count } = await supabase
      .from('email_log')
      .delete({ count: 'exact' })
      .eq('id', id)

    if (error) throw new Error(`emailLogRepository.remove: ${error.message}`)
    return (count ?? 0) > 0
  },
}
