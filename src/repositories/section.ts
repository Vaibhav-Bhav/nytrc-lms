
// TEMPORARY: in-memory store. Swap internals for Supabase queries once
// credentials land — keep these exact function signatures.

import type { Section, NewSection, UpdateSection } from '@/schemas/sections'

let sections: Section[] = []

function generateId(): string {
  return crypto.randomUUID()
}

export const sectionRepository = {
  async findByCourseId(courseId: string): Promise<Section[]> {
    return sections
      .filter((s) => s.course_id === courseId)
      .sort((a, b) => a.order_number - b.order_number)
  },

  async findById(id: string): Promise<Section | null> {
    return sections.find((s) => s.id === id) ?? null
  },

  async create(data: NewSection): Promise<Section> {
    const now = new Date().toISOString()
    const section: Section = {
      id: generateId(),
      course_id: data.course_id,
      title: data.title,
      order_number: data.order_number ?? sections.filter((s) => s.course_id === data.course_id).length,
      created_at: now,
      updated_at: now,
    }
    sections.push(section)
    return section
  },

  async update(id: string, data: UpdateSection): Promise<Section | null> {
    const idx = sections.findIndex((s) => s.id === id)
    if (idx === -1) return null

    sections[idx] = {
      ...sections[idx],
      ...data,
      updated_at: new Date().toISOString(),
    }
    return sections[idx]
  },

  async remove(id: string): Promise<boolean> {
    const before = sections.length
    sections = sections.filter((s) => s.id !== id)
    return sections.length < before
  },
}