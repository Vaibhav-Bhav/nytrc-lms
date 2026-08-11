// src/repositories/lesson.ts
//
// Supabase-backed repository for the `lessons` table.

import { supabase } from '@/lib/supabase'
import type { Lesson, NewLesson, UpdateLesson } from '@/schemas/lessons'

function toLesson(row: Record<string, unknown>): Lesson {
  return {
    id: row.id as string,
    section_id: row.section_id as string,
    title: row.title as string,
    description: (row.description as string | null) ?? null,
    pdf_url: (row.pdf_url as string | null) ?? null,
    video_id: (row.video_id as string | null) ?? null,
    allow_download: row.allow_download as boolean,
    page_count: (row.page_count as number | null) ?? null,
    lesson_order: row.lesson_order as number,
    status: row.status as 'draft' | 'published',
    published_at: (row.published_at as string | null) ?? null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  }
}

export const lessonRepository = {
  async findBySectionId(sectionId: string): Promise<Lesson[]> {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('section_id', sectionId)
      .order('lesson_order', { ascending: true })

    if (error) throw new Error(`lessonRepository.findBySectionId: ${error.message}`)
    return (data ?? []).map(toLesson)
  },

  async findById(id: string): Promise<Lesson | null> {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) throw new Error(`lessonRepository.findById: ${error.message}`)
    return data ? toLesson(data) : null
  },

  async create(data: NewLesson): Promise<Lesson> {
    let lessonOrder = data.lesson_order

    if (lessonOrder === undefined) {
      const { count, error: countErr } = await supabase
        .from('lessons')
        .select('*', { count: 'exact', head: true })
        .eq('section_id', data.section_id)

      if (countErr) throw new Error(`lessonRepository.create (count): ${countErr.message}`)
      lessonOrder = count ?? 0
    }

    const { data: row, error } = await supabase
      .from('lessons')
      .insert({
        section_id: data.section_id,
        title: data.title,
        description: data.description ?? null,
        pdf_url: data.pdf_url ?? null,
        video_id: data.video_id ?? null,
        allow_download: data.allow_download ?? false,
        page_count: data.page_count ?? null,
        lesson_order: lessonOrder,
        status: data.status ?? 'draft',
        published_at: data.published_at ?? (data.status === 'published' ? new Date().toISOString() : null),
      })
      .select()
      .single()

    if (error) throw new Error(`lessonRepository.create: ${error.message}`)
    return toLesson(row)
  },

  async update(id: string, data: UpdateLesson): Promise<Lesson | null> {
    const { data: row, error } = await supabase
      .from('lessons')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .maybeSingle()

    if (error) throw new Error(`lessonRepository.update: ${error.message}`)
    return row ? toLesson(row) : null
  },

  async updateStatusFromDraftToPublished(id: string): Promise<Lesson | null> {
    const nowIso = new Date().toISOString()
    const { data: row, error } = await supabase
      .from('lessons')
      .update({
        status: 'published',
        published_at: nowIso,
        updated_at: nowIso,
      })
      .eq('id', id)
      .eq('status', 'draft')
      .select()
      .maybeSingle()

    if (error) throw new Error(`lessonRepository.updateStatusFromDraftToPublished: ${error.message}`)
    return row ? toLesson(row) : null
  },

  async remove(id: string): Promise<boolean> {
    const { error, count } = await supabase
      .from('lessons')
      .delete({ count: 'exact' })
      .eq('id', id)

    if (error) throw new Error(`lessonRepository.remove: ${error.message}`)
    return (count ?? 0) > 0
  },

  async reorder(sectionId: string, orderedIds: string[]): Promise<Lesson[]> {
    const updates = orderedIds.map((id, index) =>
      supabase
        .from('lessons')
        .update({ lesson_order: index, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('section_id', sectionId),
    )

    const results = await Promise.all(updates)
    const failed = results.find((r) => r.error)
    if (failed?.error) {
      throw new Error(`lessonRepository.reorder: ${failed.error.message}`)
    }

    return this.findBySectionId(sectionId)
  },
}