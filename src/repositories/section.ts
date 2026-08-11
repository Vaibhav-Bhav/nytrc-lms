// src/repositories/section.ts
//
// Supabase-backed repository for the `sections` table.

import { supabase } from '@/lib/supabase'
import type { Section, NewSection, UpdateSection } from '@/schemas/sections'

function toSection(row: Record<string, unknown>): Section {
  return {
    id: row.id as string,
    course_id: row.course_id as string,
    title: row.title as string,
    order_number: row.order_number as number,
    status: (row.status as 'draft' | 'published') ?? 'draft',
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  }
}

export const sectionRepository = {
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
        status: data.status ?? 'draft',
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