// src/repositories/progress.ts
//
// Supabase-backed repository for the `progress` table.
//
// Public method signatures are identical to the in-memory version so that
// services/progress.ts requires zero changes.
//
// Expected Supabase table DDL (run once in Supabase SQL editor):
//
//   create table public.progress (
//     id                       uuid primary key default gen_random_uuid(),
//     student_id               uuid not null references public.users(id) on delete cascade,
//     lesson_id                uuid not null references public.lessons(id) on delete cascade,
//     video_progress_seconds   integer not null default 0,
//     document_progress_page   integer not null default 0,
//     completed                boolean not null default false,
//     completed_at             timestamptz,
//     created_at               timestamptz not null default now(),
//     updated_at               timestamptz not null default now(),
//
//     -- At most one progress record per student per lesson.
//     constraint progress_student_lesson_unique unique (student_id, lesson_id)
//   );
//
//   create index progress_student_id_idx on public.progress (student_id);
//   create index progress_lesson_id_idx  on public.progress (lesson_id);

import { supabase } from '@/lib/supabase'
import type { Progress, NewProgress, UpdateProgress } from '@/schemas/progress'

// -----------------------------------------------------------------------
// Internal helper — maps a raw Supabase row to the Progress type.
// -----------------------------------------------------------------------
function toProgress(row: Record<string, unknown>): Progress {
  return {
    id: row.id as string,
    student_id: row.student_id as string,
    lesson_id: row.lesson_id as string,
    video_progress_seconds: Number(row.video_progress_seconds ?? 0),
    document_progress_page: Number(row.document_progress_page ?? 0),
    completed: row.completed as boolean,
    completed_at: (row.completed_at as string | null) ?? null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  }
}

export const progressRepository = {
  async findAll(): Promise<Progress[]> {
    const { data, error } = await supabase
      .from('progress')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) throw new Error(`progressRepository.findAll: ${error.message}`)
    return (data ?? []).map(toProgress)
  },

  async findById(id: string): Promise<Progress | null> {
    const { data, error } = await supabase
      .from('progress')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) throw new Error(`progressRepository.findById: ${error.message}`)
    return data ? toProgress(data) : null
  },

  // The UNIQUE constraint on (student_id, lesson_id) makes this a safe
  // single-row lookup — maybeSingle() returns null if no record exists yet.
  async findByStudentAndLesson(
    studentId: string,
    lessonId: string,
  ): Promise<Progress | null> {
    const { data, error } = await supabase
      .from('progress')
      .select('*')
      .eq('student_id', studentId)
      .eq('lesson_id', lessonId)
      .maybeSingle()

    if (error) throw new Error(`progressRepository.findByStudentAndLesson: ${error.message}`)
    return data ? toProgress(data) : null
  },

  async findByStudent(studentId: string): Promise<Progress[]> {
    const { data, error } = await supabase
      .from('progress')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: true })

    if (error) throw new Error(`progressRepository.findByStudent: ${error.message}`)
    return (data ?? []).map(toProgress)
  },

  async create(data: NewProgress): Promise<Progress> {
    const now = new Date().toISOString()
    const { data: row, error } = await supabase
      .from('progress')
      .insert({
        student_id: data.student_id,
        lesson_id: data.lesson_id,
        video_progress_seconds: data.video_progress_seconds ?? 0,
        document_progress_page: data.document_progress_page ?? 0,
        completed: data.completed ?? false,
        // Only stamp completed_at when the record is being created as completed.
        completed_at: data.completed ? now : null,
      })
      .select()
      .single()

    if (error) throw new Error(`progressRepository.create: ${error.message}`)
    return toProgress(row)
  },

  async update(id: string, data: UpdateProgress): Promise<Progress | null> {
    const now = new Date().toISOString()

    // Mirror the original: set completed_at when completing, clear it when
    // un-completing. Only touch completed_at when data.completed is explicitly
    // provided — undefined means "don't change".
    const patch: Record<string, unknown> = {
      ...data,
      updated_at: now,
    }

    if (data.completed !== undefined) {
      patch.completed_at = data.completed ? now : null
    }

    const { data: row, error } = await supabase
      .from('progress')
      .update(patch)
      .eq('id', id)
      .select()
      .maybeSingle()

    if (error) throw new Error(`progressRepository.update: ${error.message}`)
    return row ? toProgress(row) : null
  },

  // Upsert: insert a new record or update the existing one for the same
  // (student_id, lesson_id) pair.
  //
  // Uses Supabase's native upsert with onConflict targeting the unique
  // constraint — this is a single round-trip instead of the two-step
  // find-then-create-or-update the in-memory version performed.
  async upsert(
    studentId: string,
    lessonId: string,
    data: UpdateProgress,
  ): Promise<Progress> {
    const now = new Date().toISOString()

    const upsertPayload: Record<string, unknown> = {
      student_id: studentId,
      lesson_id: lessonId,
      updated_at: now,
    }

    if (data.video_progress_seconds !== undefined) {
      upsertPayload.video_progress_seconds = data.video_progress_seconds
    }
    if (data.document_progress_page !== undefined) {
      upsertPayload.document_progress_page = data.document_progress_page
    }
    if (data.completed !== undefined) {
      upsertPayload.completed = data.completed
      upsertPayload.completed_at = data.completed ? now : null
    }

    const { data: row, error } = await supabase
      .from('progress')
      .upsert(upsertPayload, {
        onConflict: 'student_id,lesson_id',
        // ignoreDuplicates: false → always update on conflict (default).
      })
      .select()
      .single()

    if (error) throw new Error(`progressRepository.upsert: ${error.message}`)
    return toProgress(row)
  },
}
