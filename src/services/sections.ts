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
    if (!data.title || data.title.trim().length === 0) {
      throw new Error('TITLE_REQUIRED')
    }
    const course = await courseRepository.findById(data.course_id)
    if (!course) {
      throw new Error('COURSE_NOT_FOUND')
    }
    return sectionRepository.create({
      ...data,
      title: data.title.trim(),
    })
  },

  async update(id: string, data: UpdateSection) {
    const { course_id, ...updateData } = data
    if (updateData.title !== undefined) {
      if (updateData.title === null || updateData.title.trim().length === 0) {
        throw new Error('TITLE_REQUIRED')
      }
      updateData.title = updateData.title.trim()
    }
    const updated = await sectionRepository.update(id, updateData)
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