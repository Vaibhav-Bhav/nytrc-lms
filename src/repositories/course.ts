// src/repositories/course.ts
//
// TEMPORARY: in-memory store. Swap the internals of each function for
// Supabase queries once credentials land — keep these exact function
// signatures so services/courses.ts never needs to change.

import type { Course, NewCourse, UpdateCourse } from '@/schemas/courses'

let courses: Course[] = []

function generateId(): string {
  return crypto.randomUUID()
}

export const courseRepository = {
  async findAll(): Promise<Course[]> {
    return courses
  },

  async findById(id: string): Promise<Course | null> {
    return courses.find((c) => c.id === id) ?? null
  },

  async create(data: NewCourse): Promise<Course> {
    const now = new Date().toISOString()
    const course: Course = {
      id: generateId(),
      title: data.title,
      description: data.description ?? null,
      thumbnail_url: data.thumbnail_url ?? null,
      status: data.status ?? 'draft',
      created_by: data.created_by,
      created_at: now,
      updated_at: now,
    }
    courses.push(course)
    return course
  },

  async update(id: string, data: UpdateCourse): Promise<Course | null> {
    const idx = courses.findIndex((c) => c.id === id)
    if (idx === -1) return null

    courses[idx] = {
      ...courses[idx],
      ...data,
      updated_at: new Date().toISOString(),
    }
    return courses[idx]
  },

  async remove(id: string): Promise<boolean> {
    const before = courses.length
    courses = courses.filter((c) => c.id !== id)
    return courses.length < before
  },
}