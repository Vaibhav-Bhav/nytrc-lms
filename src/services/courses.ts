// src/services/courses.ts

import { courseRepository } from '@/repositories/course'
import type { NewCourse, UpdateCourse } from '@/schemas/courses'

export const courseService = {
  async findAll() {
    return courseRepository.findAll()
  },

  async findById(id: string) {
    const course = await courseRepository.findById(id)
    if (!course) {
      throw new Error('COURSE_NOT_FOUND')
    }
    return course
  },

  async create(data: NewCourse) {
    if (!data.title || data.title.trim().length === 0) {
      throw new Error('TITLE_REQUIRED')
    }
    return courseRepository.create(data)
  },

  async update(id: string, data: UpdateCourse) {
    const updated = await courseRepository.update(id, data)
    if (!updated) {
      throw new Error('COURSE_NOT_FOUND')
    }
    return updated
  },

  async remove(id: string) {
    const removed = await courseRepository.remove(id)
    if (!removed) {
      throw new Error('COURSE_NOT_FOUND')
    }
    return true
  },
}