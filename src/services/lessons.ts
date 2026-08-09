import { lessonRepository } from '@/repositories/lesson'
import { sectionRepository } from '@/repositories/section'
import { courseRepository } from '@/repositories/course'
import { courseAccessRepository } from '@/repositories/courseAccess'
import { userRepository } from '@/repositories/user'
import { sendEmail } from '@/lib/resend'
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
    // Attempt atomic transition from draft -> published to avoid duplicate concurrent email sends
    const updated = await lessonRepository.updateStatusFromDraftToPublished(id)

    if (!updated) {
      // If we couldn't transition atomically, check if it's already published (graceful success path)
      const current = await lessonRepository.findById(id)
      if (!current) {
        throw new Error('LESSON_NOT_FOUND')
      }
      return current
    }

    // Trigger Lesson Published Emails (best-effort, asynchronous)
    try {
      const section = await sectionRepository.findById(updated.section_id)
      if (section) {
        const course = await courseRepository.findById(section.course_id)
        if (course) {
          const enrollments = await courseAccessRepository.findActiveByCourseId(course.id)
          
          for (const enrollment of enrollments) {
            userRepository.findById(enrollment.student_id).then(async (user) => {
              if (user) {
                const emailSubject = `New Lesson Published: ${updated.title}`
                const emailHtml = `
                  <h1>New Lesson Available!</h1>
                  <p>Dear ${user.name || 'Student'},</p>
                  <p>A new lesson has been published in your enrolled course: <strong>${course.title}</strong>.</p>
                  <ul>
                    <li><strong>Lesson Title:</strong> ${updated.title}</li>
                    <li><strong>Section:</strong> ${section.title}</li>
                  </ul>
                  <p>Log in to your dashboard to view the content.</p>
                  <p>Happy Learning!</p>
                  <p>Best Regards,<br/>NYTRC Team</p>
                `
                await sendEmail(user.email, emailSubject, emailHtml)
                console.log(`[lessonService] Lesson published email sent successfully to ${user.email}`)
              }
            }).catch((err) => {
              console.error(`[lessonService] Failed to send lesson publication email to student ${enrollment.student_id}:`, err)
            })
          }
        }
      }
    } catch (err) {
      console.error('[lessonService] Failed to execute lesson publish notification hook:', err)
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