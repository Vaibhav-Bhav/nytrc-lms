import { lessonRepository } from '@/repositories/lesson'
import { sectionRepository } from '@/repositories/section'
import type { NewLesson, UpdateLesson } from '@/schemas/lessons'

export const lessonService = {
  async findBySectionId(sectionId: string) {
    return lessonRepository.findBySectionId(sectionId)
  },

  async findById(id: string) {
    const lesson = await lessonRepository.findById(id)
    if (!lesson) {
      throw new Error('LESSON_NOT_FOUND')
    }
    return lesson
  },

  async create(data: NewLesson) {
    const section = await sectionRepository.findById(data.section_id)
    if (!section) {
      throw new Error('SECTION_NOT_FOUND')
    }
    return lessonRepository.create(data)
  },

  async update(id: string, data: UpdateLesson) {
    const updated = await lessonRepository.update(id, data)
    if (!updated) {
      throw new Error('LESSON_NOT_FOUND')
    }
    return updated
  },

  async remove(id: string) {
    const removed = await lessonRepository.remove(id)
    if (!removed) {
      throw new Error('LESSON_NOT_FOUND')
    }
    return true
  },

  async publish(id: string) {
    const updated = await lessonRepository.update(id, { status: 'published' })
    if (!updated) {
      throw new Error('LESSON_NOT_FOUND')
    }
    return updated
  },

  async unpublish(id: string) {
    const updated = await lessonRepository.update(id, { status: 'draft' })
    if (!updated) {
      throw new Error('LESSON_NOT_FOUND')
    }
    return updated
  },

  async reorder(sectionId: string, orderedIds: string[]) {
    const section = await sectionRepository.findById(sectionId)
    if (!section) {
      throw new Error('SECTION_NOT_FOUND')
    }
    return lessonRepository.reorder(sectionId, orderedIds)
  },
}