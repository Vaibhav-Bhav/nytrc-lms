// src/repositories/courseAccess.ts
//
// Supabase-backed repository for the `course_access` table.
//
// Public method signatures are identical to the in-memory version so that
// services/payment.ts and services/student.ts require zero changes.
//
// Expected Supabase table DDL (run once in Supabase SQL editor):
//
//   create table public.course_access (
//     id             uuid primary key default gen_random_uuid(),
//     student_id     uuid not null references public.users(id),
//     course_id      uuid not null references public.courses(id),
//     payment_id     uuid references public.payments(id),
//     access_status  text not null default 'active'
//                      check (access_status in ('active','revoked','expired')),
//     granted_at     timestamptz not null default now(),
//     revoked_at     timestamptz,
//     created_at     timestamptz not null default now(),
//     updated_at     timestamptz not null default now()
//   );
//
//   -- Enforce one active entitlement per student per course at the DB level.
//   create unique index course_access_active_unique_idx
//     on public.course_access (student_id, course_id)
//     where access_status = 'active';
//
//   create index course_access_student_id_idx on public.course_access (student_id);

import { supabase } from '@/lib/supabase'
import type { CourseAccess, NewCourseAccess, UpdateCourseAccess } from '@/schemas/courseAccess'

// -----------------------------------------------------------------------
// Internal helper — maps a raw Supabase row to the CourseAccess type.
// -----------------------------------------------------------------------
function toCourseAccess(row: Record<string, unknown>): CourseAccess {
  return {
    id: row.id as string,
    student_id: row.student_id as string,
    course_id: row.course_id as string,
    payment_id: (row.payment_id as string | null) ?? null,
    access_status: row.access_status as 'active' | 'revoked' | 'expired',
    granted_at: row.granted_at as string,
    revoked_at: (row.revoked_at as string | null) ?? null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  }
}

export const courseAccessRepository = {
  async findAll(): Promise<CourseAccess[]> {
    const { data, error } = await supabase
      .from('course_access')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) throw new Error(`courseAccessRepository.findAll: ${error.message}`)
    return (data ?? []).map(toCourseAccess)
  },

  async findById(id: string): Promise<CourseAccess | null> {
    const { data, error } = await supabase
      .from('course_access')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) throw new Error(`courseAccessRepository.findById: ${error.message}`)
    return data ? toCourseAccess(data) : null
  },

  // The partial unique index in the DDL ensures at most one active row per
  // (student_id, course_id) pair, so maybeSingle() is always safe here.
  async findActiveByStudentAndCourse(
    studentId: string,
    courseId: string,
  ): Promise<CourseAccess | null> {
    const { data, error } = await supabase
      .from('course_access')
      .select('*')
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .eq('access_status', 'active')
      .maybeSingle()

    if (error) {
      throw new Error(`courseAccessRepository.findActiveByStudentAndCourse: ${error.message}`)
    }
    return data ? toCourseAccess(data) : null
  },

  async findActiveByCourseId(courseId: string): Promise<CourseAccess[]> {
    const { data, error } = await supabase
      .from('course_access')
      .select('*')
      .eq('course_id', courseId)
      .eq('access_status', 'active')

    if (error) {
      throw new Error(`courseAccessRepository.findActiveByCourseId: ${error.message}`)
    }
    return (data ?? []).map(toCourseAccess)
  },

  async create(data: NewCourseAccess): Promise<CourseAccess> {
    const now = new Date().toISOString()

    const { data: row, error } = await supabase
      .from('course_access')
      .insert({
        student_id: data.student_id,
        course_id: data.course_id,
        payment_id: data.payment_id ?? null,
        access_status: data.access_status ?? 'active',
        granted_at: now,
      })
      .select()
      .single()

    if (error) throw new Error(`courseAccessRepository.create: ${error.message}`)
    return toCourseAccess(row)
  },

  async update(id: string, data: UpdateCourseAccess): Promise<CourseAccess | null> {
    const { data: row, error } = await supabase
      .from('course_access')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .maybeSingle()

    if (error) throw new Error(`courseAccessRepository.update: ${error.message}`)
    return row ? toCourseAccess(row) : null
  },

  async remove(id: string): Promise<boolean> {
    const { error, count } = await supabase
      .from('course_access')
      .delete({ count: 'exact' })
      .eq('id', id)

    if (error) throw new Error(`courseAccessRepository.remove: ${error.message}`)
    return (count ?? 0) > 0
  },
}
