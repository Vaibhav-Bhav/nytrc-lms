// src/repositories/payment.ts
//
// Supabase-backed repository for the `payments` table.

import { supabase } from '@/lib/supabase'
import type { Payment, NewPayment, UpdatePayment } from '@/schemas/payments'

function toPayment(row: Record<string, unknown>): Payment {
  return {
    id: row.id as string,
    student_id: row.student_id as string,
    course_id: row.course_id as string,
    razorpay_order_id: (row.razorpay_order_id as string | null) ?? null,
    razorpay_payment_id: (row.razorpay_payment_id as string | null) ?? null,
    invoice_id: (row.invoice_id as string | null) ?? null,
    payment_status: row.payment_status as 'pending' | 'success' | 'failed' | 'refunded',
    amount_paid: Number(row.amount_paid),
    currency: row.currency as string,
    gst_state: (row.gst_state as string | null) ?? null,
    method: (row.method as string | null) ?? null,
    raw_payload: row.raw_payload ?? null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  }
}

export const paymentRepository = {
  async findAll(): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) throw new Error(`paymentRepository.findAll: ${error.message}`)
    return (data ?? []).map(toPayment)
  },

  async findById(id: string): Promise<Payment | null> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) throw new Error(`paymentRepository.findById: ${error.message}`)
    return data ? toPayment(data) : null
  },

  async findByStudentId(studentId: string): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`paymentRepository.findByStudentId: ${error.message}`)
    return (data ?? []).map(toPayment)
  },

  async findByCourseId(courseId: string): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('course_id', courseId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`paymentRepository.findByCourseId: ${error.message}`)
    return (data ?? []).map(toPayment)
  },

  async findByRazorpayOrderId(razorpayOrderId: string): Promise<Payment | null> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('razorpay_order_id', razorpayOrderId)
      .maybeSingle()

    if (error) throw new Error(`paymentRepository.findByRazorpayOrderId: ${error.message}`)
    return data ? toPayment(data) : null
  },

  async create(data: NewPayment): Promise<Payment> {
    const { data: row, error } = await supabase
      .from('payments')
      .insert({
        student_id: data.student_id,
        course_id: data.course_id,
        payment_status: 'pending',
        amount_paid: data.amount_paid,
        currency: data.currency ?? 'INR',
        gst_state: data.gst_state ?? null,
        method: data.method ?? null,
        raw_payload: data.raw_payload ?? null,
      })
      .select()
      .single()

    if (error) throw new Error(`paymentRepository.create: ${error.message}`)
    return toPayment(row)
  },

  async update(id: string, data: UpdatePayment): Promise<Payment | null> {
    const { data: row, error } = await supabase
      .from('payments')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .maybeSingle()

    if (error) throw new Error(`paymentRepository.update: ${error.message}`)
    return row ? toPayment(row) : null
  },

  async remove(id: string): Promise<boolean> {
    const { error, count } = await supabase
      .from('payments')
      .delete({ count: 'exact' })
      .eq('id', id)

    if (error) throw new Error(`paymentRepository.remove: ${error.message}`)
    return (count ?? 0) > 0
  },
}
