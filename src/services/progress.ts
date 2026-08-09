// src/services/progress.ts

import { progressRepository } from '@/repositories/progress'
import { lessonRepository } from '@/repositories/lesson'
import { sectionRepository } from '@/repositories/section'
import { courseRepository } from '@/repositories/course'

export const progressService = {
  /**
   * Updates student progress for a specific lesson.
   */
  async updateProgress(
    studentId: string,
    lessonId: string,
    videoProgressSeconds?: number,
    documentProgressPage?: number,
  ) {
    // 1. Validate lesson exists
    const lesson = await lessonRepository.findById(lessonId)
    if (!lesson) {
      throw new Error('LESSON_NOT_FOUND')
    }

    // 2. Perform upsert on progress record
    const updated = await progressRepository.upsert(studentId, lessonId, {
      video_progress_seconds: videoProgressSeconds,
      document_progress_page: documentProgressPage,
    })

    return {
      lessonId: updated.lesson_id,
      video_progress_seconds: updated.video_progress_seconds,
      document_progress_page: updated.document_progress_page,
      completed: updated.completed,
      completed_at: updated.completed_at,
    }
  },

  /**
   * Marks a specific lesson as completed.
   */
  async markLessonCompleted(studentId: string, lessonId: string) {
    // 1. Validate lesson exists
    const lesson = await lessonRepository.findById(lessonId)
    if (!lesson) {
      throw new Error('LESSON_NOT_FOUND')
    }

    // 2. Upsert completion details
    const updated = await progressRepository.upsert(studentId, lessonId, {
      completed: true,
    })

    return {
      lessonId: updated.lesson_id,
      video_progress_seconds: updated.video_progress_seconds,
      document_progress_page: updated.document_progress_page,
      completed: updated.completed,
      completed_at: updated.completed_at,
    }
  },

  /**
   * Retrieves lesson progress details for a student.
   */
  async getLessonProgress(studentId: string, lessonId: string) {
    const lesson = await lessonRepository.findById(lessonId)
    if (!lesson) {
      throw new Error('LESSON_NOT_FOUND')
    }

    const progress = await progressRepository.findByStudentAndLesson(studentId, lessonId)
    if (!progress) {
      // Return default empty progress if no history exists yet
      return {
        lessonId,
        video_progress_seconds: 0,
        document_progress_page: 0,
        completed: false,
        completed_at: null,
      }
    }

    return {
      lessonId: progress.lesson_id,
      video_progress_seconds: progress.video_progress_seconds,
      document_progress_page: progress.document_progress_page,
      completed: progress.completed,
      completed_at: progress.completed_at,
    }
  },

  /**
   * Calculates the student's completion progress for a course.
   */
  async calculateCourseCompletion(studentId: string, courseId: string) {
    // 1. Validate course exists
    const course = await courseRepository.findById(courseId)
    if (!course) {
      throw new Error('COURSE_NOT_FOUND')
    }

    // 2. Retrieve sections for the course
    const sections = await sectionRepository.findByCourseId(courseId)
    
    // 3. Collect all published lessons
    const publishedLessons = []
    for (const section of sections) {
      const lessons = await lessonRepository.findBySectionId(section.id)
      const published = lessons.filter((l) => l.status === 'published')
      publishedLessons.push(...published)
    }

    const totalLessons = publishedLessons.length
    if (totalLessons === 0) {
      return {
        completedLessons: 0,
        totalLessons: 0,
        percentage: 0,
      }
    }

    // 4. Determine how many lessons are completed
    let completedCount = 0
    for (const lesson of publishedLessons) {
      const progress = await progressRepository.findByStudentAndLesson(studentId, lesson.id)
      if (progress && progress.completed) {
        completedCount++
      }
    }

    const percentage = Math.round((completedCount / totalLessons) * 100)

    return {
      completedLessons: completedCount,
      totalLessons,
      percentage,
    }
  },
}
