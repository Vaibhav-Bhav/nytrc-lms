// src/services/courses.ts

import { courseRepository } from '@/repositories/course'
import type { NewCourse, UpdateCourse } from '@/schemas/courses'

export const courseService = {
  async findAll() {
    return courseRepository.findAll()
  },

  async findPublished() {
    return courseRepository.findPublished()
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
    const description = (data.description === undefined || data.description === null || data.description.trim() === '') ? null : data.description
    const thumbnail_url = (data.thumbnail_url === undefined || data.thumbnail_url === null || data.thumbnail_url.trim() === '') ? null : data.thumbnail_url

    return courseRepository.create({
      ...data,
      description,
      thumbnail_url,
    })
  },

  async update(id: string, data: UpdateCourse) {
    const { created_by, ...updateData } = data

    if (updateData.description !== undefined) {
      updateData.description = (updateData.description === null || updateData.description.trim() === '') ? null : updateData.description
    }
    if (updateData.thumbnail_url !== undefined) {
      updateData.thumbnail_url = (updateData.thumbnail_url === null || updateData.thumbnail_url.trim() === '') ? null : updateData.thumbnail_url
    }

    const updated = await courseRepository.update(id, updateData)
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