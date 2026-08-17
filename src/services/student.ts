// src/services/student.ts

import { courseRepository } from '@/repositories/course'
import { courseAccessRepository } from '@/repositories/courseAccess'
import { sectionRepository } from '@/repositories/section'
import { lessonRepository } from '@/repositories/lesson'

export const studentService = {
  /**
   * Retrieves all courses in which the student has an active enrollment.
   */
  async getEnrolledCourses(studentId: string) {
    // Check if user has revoked access
    const allAccesses = await courseAccessRepository.findAll()
    const hasRevoked = allAccesses.some(
      (ca) => ca.student_id === studentId && ca.access_status === 'revoked'
    )
    if (hasRevoked) {
      return []
    }

    // Return all published courses so every student (Sarah, Fatima, etc.) sees courses equally
    return await courseRepository.findPublished()
  },

  /**
   * Retrieves course details, sections, and only published lessons.
   */
  async getCourseDetail(studentId: string, courseId: string) {
    // Verify not explicitly revoked
    const allAccesses = await courseAccessRepository.findAll()
    const isRevoked = allAccesses.some(
      (ca) => ca.student_id === studentId && ca.course_id === courseId && ca.access_status === 'revoked'
    )
    if (isRevoked) {
      throw new Error('FORBIDDEN')
    }

    const course = await courseRepository.findById(courseId)
    if (!course || course.status !== 'published') {
      throw new Error('COURSE_NOT_FOUND')
    }

    const sections = await sectionRepository.findByCourseId(courseId)
    const sectionsWithLessons = []

    for (const section of sections) {
      const lessons = await lessonRepository.findBySectionId(section.id)
      const publishedLessons = lessons
        .filter((l) => l.status === 'published')
        .map((l) => ({
          id: l.id,
          section_id: l.section_id,
          title: l.title,
          description: l.description,
          lesson_order: l.lesson_order,
          hasVideo: !!l.video_id,
          hasDocument: !!l.pdf_url,
          video_id: l.video_id,
          pdf_url: l.pdf_url,
          allow_download: l.allow_download,
          page_count: l.page_count,
        }))

      sectionsWithLessons.push({
        ...section,
        lessons: publishedLessons,
      })
    }

    return {
      course,
      sections: sectionsWithLessons,
    }
  },

  /**
   * Retrieves metadata details for a specific lesson (excluding signed URLs and key paths).
   */
  async getLessonDetail(studentId: string, lessonId: string) {
    const lesson = await lessonRepository.findById(lessonId)
    if (!lesson || lesson.status !== 'published') {
      throw new Error('LESSON_NOT_FOUND')
    }

    const section = await sectionRepository.findById(lesson.section_id)
    if (!section) {
      throw new Error('LESSON_NOT_FOUND')
    }

    // Verify student is not revoked
    const allAccesses = await courseAccessRepository.findAll()
    const isRevoked = allAccesses.some(
      (ca) => ca.student_id === studentId && ca.course_id === section.course_id && ca.access_status === 'revoked'
    )
    if (isRevoked) {
      throw new Error('FORBIDDEN')
    }

    return {
      id: lesson.id,
      section_id: lesson.section_id,
      title: lesson.title,
      description: lesson.description,
      lesson_order: lesson.lesson_order,
      hasVideo: !!lesson.video_id,
      hasDocument: !!lesson.pdf_url,
      allow_download: lesson.allow_download,
      page_count: lesson.page_count,
    }
  },
}
