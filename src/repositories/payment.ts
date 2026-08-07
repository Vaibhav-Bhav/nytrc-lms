// src/repositories/payment.ts
//
// TEMPORARY: in-memory store. Swap the internals of each function for
// Supabase queries once credentials land — keep these exact function
// signatures so services/payment.ts never needs to change.

import type { Payment, NewPayment, UpdatePayment } from '@/schemas/payments'

let payments: Payment[] = []

function generateId(): string {
  return crypto.randomUUID()
}

export const paymentRepository = {
  async findAll(): Promise<Payment[]> {
    return payments
  },

  async findById(id: string): Promise<Payment | null> {
    return payments.find((p) => p.id === id) ?? null
  },

  async findByStudentId(studentId: string): Promise<Payment[]> {
    return payments.filter((p) => p.student_id === studentId)
  },

  async findByCourseId(courseId: string): Promise<Payment[]> {
    return payments.filter((p) => p.course_id === courseId)
  },

  async findByRazorpayOrderId(razorpayOrderId: string): Promise<Payment | null> {
    return payments.find((p) => p.razorpay_order_id === razorpayOrderId) ?? null
  },

  async create(data: NewPayment): Promise<Payment> {
    const now = new Date().toISOString()
    const payment: Payment = {
      id: generateId(),
      student_id: data.student_id,
      course_id: data.course_id,
      razorpay_order_id: null,
      razorpay_payment_id: null,
      invoice_id: null,
      payment_status: 'pending',
      amount_paid: data.amount_paid,
      currency: data.currency ?? 'INR',
      gst_state: data.gst_state ?? null,
      created_at: now,
      updated_at: now,
    }
    payments.push(payment)
    return payment
  },

  async update(id: string, data: UpdatePayment): Promise<Payment | null> {
    const idx = payments.findIndex((p) => p.id === id)
    if (idx === -1) return null

    payments[idx] = {
      ...payments[idx],
      ...data,
      updated_at: new Date().toISOString(),
    }
    return payments[idx]
  },

  async remove(id: string): Promise<boolean> {
    const before = payments.length
    payments = payments.filter((p) => p.id !== id)
    return payments.length < before
  },
}
