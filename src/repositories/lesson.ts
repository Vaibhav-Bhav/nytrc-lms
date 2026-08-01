// src/repositories/lesson.ts
//
// TEMPORARY: in-memory store. Swap internals for Supabase queries once
// credentials land — keep these exact function signatures.

import type { Lesson, NewLesson, UpdateLesson } from '@/schemas/lessons'

let lessons: Lesson[] = []

function generateId(): string {
  return crypto.randomUUID()
}

export const lessonRepository = {
  async findBySectionId(sectionId: string): Promise<Lesson[]> {
    return lessons
      .filter((l) => l.section_id === sectionId)
      .sort((a, b) => a.lesson_order - b.lesson_order)
  },

  async findById(id: string): Promise<Lesson | null> {
    return lessons.find((l) => l.id === id) ?? null
  },

  async create(data: NewLesson): Promise<Lesson> {
    const now = new Date().toISOString()
    const lesson: Lesson = {
      id: generateId(),
      section_id: data.section_id,
      title: data.title,
      description: data.description ?? null,
      pdf_url: data.pdf_url ?? null,
      video_id: data.video_id ?? null,
      allow_download: data.allow_download ?? false,
      page_count: data.page_count ?? null,
      lesson_order:
        data.lesson_order ?? lessons.filter((l) => l.section_id === data.section_id).length,
      status: data.status ?? 'draft',
      created_at: now,
      updated_at: now,
    }
    lessons.push(lesson)
    return lesson
  },

  async update(id: string, data: UpdateLesson): Promise<Lesson | null> {
    const idx = lessons.findIndex((l) => l.id === id)
    if (idx === -1) return null

    lessons[idx] = {
      ...lessons[idx],
      ...data,
      updated_at: new Date().toISOString(),
    }
    return lessons[idx]
  },

  async remove(id: string): Promise<boolean> {
    const before = lessons.length
    lessons = lessons.filter((l) => l.id !== id)
    return lessons.length < before
  },

  async reorder(sectionId: string, orderedIds: string[]): Promise<Lesson[]> {
    orderedIds.forEach((id, index) => {
      const idx = lessons.findIndex((l) => l.id === id && l.section_id === sectionId)
      if (idx !== -1) {
        lessons[idx] = { ...lessons[idx], lesson_order: index, updated_at: new Date().toISOString() }
      }
    })
    return lessonRepository.findBySectionId(sectionId)
  },
}