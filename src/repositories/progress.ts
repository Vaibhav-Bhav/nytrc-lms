// src/repositories/progress.ts
//
// TEMPORARY: in-memory store. Swap internals for Supabase queries once
// credentials land — keep these exact function signatures.

import type { Progress, NewProgress, UpdateProgress } from '@/schemas/progress'

let progresses: Progress[] = []

function generateId(): string {
  return crypto.randomUUID()
}

export const progressRepository = {
  async findAll(): Promise<Progress[]> {
    return progresses
  },

  async findById(id: string): Promise<Progress | null> {
    return progresses.find((p) => p.id === id) ?? null
  },

  async findByStudentAndLesson(studentId: string, lessonId: string): Promise<Progress | null> {
    return progresses.find((p) => p.student_id === studentId && p.lesson_id === lessonId) ?? null
  },

  async findByStudent(studentId: string): Promise<Progress[]> {
    return progresses.filter((p) => p.student_id === studentId)
  },

  async create(data: NewProgress): Promise<Progress> {
    const now = new Date().toISOString()
    const record: Progress = {
      id: generateId(),
      student_id: data.student_id,
      lesson_id: data.lesson_id,
      video_progress_seconds: data.video_progress_seconds ?? 0,
      document_progress_page: data.document_progress_page ?? 0,
      completed: data.completed ?? false,
      completed_at: data.completed ? now : null,
      created_at: now,
      updated_at: now,
    }
    progresses.push(record)
    return record
  },

  async update(id: string, data: UpdateProgress): Promise<Progress | null> {
    const idx = progresses.findIndex((p) => p.id === id)
    if (idx === -1) return null

    const now = new Date().toISOString()
    const updatedRecord = {
      ...progresses[idx],
      ...data,
      updated_at: now,
    }

    if (data.completed !== undefined) {
      updatedRecord.completed_at = data.completed ? now : null
    }

    progresses[idx] = updatedRecord
    return updatedRecord
  },

  async upsert(studentId: string, lessonId: string, data: UpdateProgress): Promise<Progress> {
    const existing = await this.findByStudentAndLesson(studentId, lessonId)
    if (existing) {
      const updated = await this.update(existing.id, data)
      if (!updated) {
        throw new Error('FAILED_TO_UPDATE_PROGRESS')
      }
      return updated
    }

    return this.create({
      student_id: studentId,
      lesson_id: lessonId,
      video_progress_seconds: data.video_progress_seconds,
      document_progress_page: data.document_progress_page,
      completed: data.completed,
    })
  },
}
