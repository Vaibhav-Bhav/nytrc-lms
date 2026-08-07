// src/repositories/courseAccess.ts
//
// TEMPORARY: in-memory store. Swap the internals of each function for
// Supabase queries once credentials land — keep these exact function
// signatures.

import type { CourseAccess, NewCourseAccess, UpdateCourseAccess } from '@/schemas/courseAccess'

let courseAccesses: CourseAccess[] = []

function generateId(): string {
  return crypto.randomUUID()
}

export const courseAccessRepository = {
  async findAll(): Promise<CourseAccess[]> {
    return courseAccesses
  },

  async findById(id: string): Promise<CourseAccess | null> {
    return courseAccesses.find((ca) => ca.id === id) ?? null
  },

  async findActiveByStudentAndCourse(studentId: string, courseId: string): Promise<CourseAccess | null> {
    return courseAccesses.find(
      (ca) =>
        ca.student_id === studentId &&
        ca.course_id === courseId &&
        ca.access_status === 'active'
    ) ?? null
  },

  async create(data: NewCourseAccess): Promise<CourseAccess> {
    const now = new Date().toISOString()
    const courseAccess: CourseAccess = {
      id: generateId(),
      student_id: data.student_id,
      course_id: data.course_id,
      payment_id: data.payment_id ?? null,
      access_status: data.access_status ?? 'active',
      granted_at: now,
      revoked_at: null,
      created_at: now,
      updated_at: now,
    }
    courseAccesses.push(courseAccess)
    return courseAccess
  },

  async update(id: string, data: UpdateCourseAccess): Promise<CourseAccess | null> {
    const idx = courseAccesses.findIndex((ca) => ca.id === id)
    if (idx === -1) return null

    courseAccesses[idx] = {
      ...courseAccesses[idx],
      ...data,
      updated_at: new Date().toISOString(),
    }
    return courseAccesses[idx]
  },

  async remove(id: string): Promise<boolean> {
    const before = courseAccesses.length
    courseAccesses = courseAccesses.filter((ca) => ca.id !== id)
    return courseAccesses.length < before
  },
}
