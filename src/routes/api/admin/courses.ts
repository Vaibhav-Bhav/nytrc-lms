// src/routes/api/admin/courses.ts

import { createFileRoute } from '@tanstack/react-router'
import { courseService } from '@/services/courses'
import { newCourseSchema } from '@/schemas/courses'
import { requireAdmin } from '@/middleware/auth'

export const Route = createFileRoute('/api/admin/courses')({
    server: {
        handlers: {
            GET: async ({ request }) => {
                await requireAdmin(request)

                try {
                    const courses = await courseService.findAll()
                    return Response.json(courses)
                } catch (err) {
                    console.error('[admin/courses GET] Unexpected error:', err)
                    return Response.json({ error: 'Internal server error' }, { status: 500 })
                }
            },

            POST: async ({ request }) => {
                await requireAdmin(request)
                const user = (request as any).user

                try {
                    const body = await request.json()
                    
                    // Assign the authenticated user as the creator
                    if (user && user.id) {
                        body.created_by = user.id
                    }

                    const parsed = newCourseSchema.safeParse(body)
                    if (!parsed.success) {
                        return Response.json(
                            { error: 'Validation failed', details: parsed.error.issues },
                            { status: 400 },
                        )
                    }
                    const course = await courseService.create(parsed.data)
                    return Response.json(course, { status: 201 })
                } catch (err) {
                    if (err instanceof Error && err.message === 'TITLE_REQUIRED') {
                        return Response.json({ error: 'Course title is required' }, { status: 400 })
                    }
                    console.error('[admin/courses POST] Unexpected error:', err)
                    return Response.json({ error: 'Internal server error' }, { status: 500 })
                }
            },
        },
    },
})