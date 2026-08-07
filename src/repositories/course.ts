// src/repositories/course.ts
//
// Supabase-backed repository for the `courses` table.
//
// Public method signatures are identical to the in-memory version so that
// services/courses.ts requires zero changes.
//
// Expected Supabase table DDL (run once in Supabase SQL editor):
//
//   create table public.courses (
//     id            uuid primary key default gen_random_uuid(),
//     title         text not null,
//     description   text,
//     thumbnail_url text,
//     status        text not null default 'draft' check (status in ('draft','published')),
//     created_by    uuid not null references public.users(id),
//     created_at    timestamptz not null default now(),
//     updated_at    timestamptz not null default now()
//   );

import { supabase } from '@/lib/supabase'
import type { Course, NewCourse, UpdateCourse } from '@/schemas/courses'

// -----------------------------------------------------------------------
// Internal helper — maps a raw Supabase row to the Course type.
// -----------------------------------------------------------------------
function toCourse(row: Record<string, unknown>): Course {
  return {
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string | null) ?? null,
    thumbnail_url: (row.thumbnail_url as string | null) ?? null,
    status: row.status as 'draft' | 'published',
    created_by: row.created_by as string,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  }
}

export const courseRepository = {
  async findAll(): Promise<Course[]> {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) throw new Error(`courseRepository.findAll: ${error.message}`)
    return (data ?? []).map(toCourse)
  },

  async findById(id: string): Promise<Course | null> {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) throw new Error(`courseRepository.findById: ${error.message}`)
    return data ? toCourse(data) : null
  },

  async create(data: NewCourse): Promise<Course> {
    const { data: row, error } = await supabase
      .from('courses')
      .insert({
        title: data.title,
        description: data.description ?? null,
        thumbnail_url: data.thumbnail_url ?? null,
        status: data.status ?? 'draft',
        created_by: data.created_by,
      })
      .select()
      .single()

    if (error) throw new Error(`courseRepository.create: ${error.message}`)
    return toCourse(row)
  },

  async update(id: string, data: UpdateCourse): Promise<Course | null> {
    const { data: row, error } = await supabase
      .from('courses')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .maybeSingle()

    if (error) throw new Error(`courseRepository.update: ${error.message}`)
    return row ? toCourse(row) : null
  },

  async remove(id: string): Promise<boolean> {
    const { error, count } = await supabase
      .from('courses')
      .delete({ count: 'exact' })
      .eq('id', id)

    if (error) throw new Error(`courseRepository.remove: ${error.message}`)
    return (count ?? 0) > 0
  },
}