import { sectionRepository } from '@/repositories/section'
import { courseRepository } from '@/repositories/course'
import type { NewSection, UpdateSection } from '@/schemas/sections'

export const sectionService = {
  async findByCourseId(courseId: string) {
    return sectionRepository.findByCourseId(courseId)
  },

  async findById(id: string) {
    const section = await sectionRepository.findById(id)
    if (!section) {
      throw new Error('SECTION_NOT_FOUND')
    }
    return section
  },

  async create(data: NewSection) {
    const course = await courseRepository.findById(data.course_id)
    if (!course) {
      throw new Error('COURSE_NOT_FOUND')
    }
    return sectionRepository.create(data)
  },

  async update(id: string, data: UpdateSection) {
    const updated = await sectionRepository.update(id, data)
    if (!updated) {
      throw new Error('SECTION_NOT_FOUND')
    }
    return updated
  },

  async remove(id: string) {
    const removed = await sectionRepository.remove(id)
    if (!removed) {
      throw new Error('SECTION_NOT_FOUND')
    }
    return true
  },
}