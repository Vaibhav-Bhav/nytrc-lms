// src/repositories/section.ts
//
// Supabase-backed repository for the `sections` table.
//
// Public method signatures are identical to the in-memory version so that
// services/sections.ts requires zero changes.
//
// Expected Supabase table DDL (run once in Supabase SQL editor):
//
//   create table public.sections (
//     id           uuid primary key default gen_random_uuid(),
//     course_id    uuid not null references public.courses(id) on delete cascade,
//     title        text not null,
//     order_number integer not null default 0,
//     created_at   timestamptz not null default now(),
//     updated_at   timestamptz not null default now()
//   );
//
//   create index sections_course_id_idx on public.sections (course_id, order_number);

import { supabase } from '@/lib/supabase'
import type { Section, NewSection, UpdateSection } from '@/schemas/sections'

// -----------------------------------------------------------------------
// Internal helper — maps a raw Supabase row to the Section type.
// -----------------------------------------------------------------------
function toSection(row: Record<string, unknown>): Section {
  return {
    id: row.id as string,
    course_id: row.course_id as string,
    title: row.title as string,
    order_number: row.order_number as number,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  }
}

export const sectionRepository = {
  // Returns sections ordered by order_number ascending — mirrors the
  // original .sort((a, b) => a.order_number - b.order_number).
  async findByCourseId(courseId: string): Promise<Section[]> {
    const { data, error } = await supabase
      .from('sections')
      .select('*')
      .eq('course_id', courseId)
      .order('order_number', { ascending: true })

    if (error) throw new Error(`sectionRepository.findByCourseId: ${error.message}`)
    return (data ?? []).map(toSection)
  },

  async findById(id: string): Promise<Section | null> {
    const { data, error } = await supabase
      .from('sections')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) throw new Error(`sectionRepository.findById: ${error.message}`)
    return data ? toSection(data) : null
  },

  async create(data: NewSection): Promise<Section> {
    // If order_number is not supplied, derive it as the current section count
    // for this course — same logic as the previous in-memory implementation.
    let orderNumber = data.order_number

    if (orderNumber === undefined) {
      const { count, error: countErr } = await supabase
        .from('sections')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', data.course_id)

      if (countErr) throw new Error(`sectionRepository.create (count): ${countErr.message}`)
      orderNumber = count ?? 0
    }

    const { data: row, error } = await supabase
      .from('sections')
      .insert({
        course_id: data.course_id,
        title: data.title,
        order_number: orderNumber,
      })
      .select()
      .single()

    if (error) throw new Error(`sectionRepository.create: ${error.message}`)
    return toSection(row)
  },

  async update(id: string, data: UpdateSection): Promise<Section | null> {
    const { data: row, error } = await supabase
      .from('sections')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .maybeSingle()

    if (error) throw new Error(`sectionRepository.update: ${error.message}`)
    return row ? toSection(row) : null
  },

  async remove(id: string): Promise<boolean> {
    const { error, count } = await supabase
      .from('sections')
      .delete({ count: 'exact' })
      .eq('id', id)

    if (error) throw new Error(`sectionRepository.remove: ${error.message}`)
    return (count ?? 0) > 0
  },
}