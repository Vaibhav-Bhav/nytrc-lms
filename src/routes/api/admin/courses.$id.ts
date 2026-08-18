// src/routes/api/admin/courses.$id.ts

import { createFileRoute } from '@tanstack/react-router'
import { courseService } from '@/services/courses'
import { updateCourseSchema } from '@/schemas/courses'
import { requireAdmin } from '@/middleware/auth'
import { createNotification } from '@/services/notification'

export const Route = createFileRoute('/api/admin/courses/$id')({
    server: {
        handlers: {
            PUT: async ({ params, request }) => {
                await requireAdmin(request)

                try {
                    const body = await request.json()
                    const parsed = updateCourseSchema.safeParse(body)
                    if (!parsed.success) {
                        return Response.json(
                            { error: 'Validation failed', issues: parsed.error.issues },
                            { status: 400 },
                        )
                    }
                    const updated = await courseService.update(params.id, parsed.data)

                    await createNotification({
                        targetRole: 'admin',
                        title: 'Course Updated',
                        message: `Course "${updated.title}" details were updated.`,
                        type: 'course_update',
                        link: '/admin/content',
                    }).catch(() => {})

                    await createNotification({
                        targetRole: 'student',
                        title: 'Course Updated',
                        message: `Course "${updated.title}" has been updated with new information.`,
                        type: 'course_update',
                        link: '/student/courses',
                    }).catch(() => {})

                    return Response.json(updated)
                } catch (err) {
                    if (err instanceof Error && err.message === 'COURSE_NOT_FOUND') {
                        return Response.json({ error: 'Course not found' }, { status: 404 })
                    }
                    return Response.json({ error: 'Internal server error' }, { status: 500 })
                }
            },

            DELETE: async ({ params, request }) => {
                await requireAdmin(request)

                try {
                    const existing = await courseService.findById(params.id).catch(() => null)
                    await courseService.remove(params.id)

                    const title = existing?.title || 'Course'

                    await createNotification({
                        targetRole: 'admin',
                        title: 'Course Removed',
                        message: `Course "${title}" was removed from the system.`,
                        type: 'course_update',
                        link: '/admin/content',
                    }).catch(() => {})

                    await createNotification({
                        targetRole: 'student',
                        title: 'Course Removed',
                        message: `Course "${title}" is no longer available in the catalog.`,
                        type: 'course_update',
                        link: '/student/courses',
                    }).catch(() => {})

                    return new Response(null, { status: 204 })
                } catch (err) {
                    if (err instanceof Error && err.message === 'COURSE_NOT_FOUND') {
                        return Response.json({ error: 'Course not found' }, { status: 404 })
                    }
                    return Response.json({ error: 'Internal server error' }, { status: 500 })
                }
            },
        },
    },
})