// src/routes/api/admin/courses.ts

import { createFileRoute } from '@tanstack/react-router'
import { courseService } from '@/services/courses'
import { newCourseSchema } from '@/schemas/courses'
import { requireAdmin } from '@/middleware/auth'

export const Route = createFileRoute('/api/admin/courses')({
    server: {
        handlers: {
            POST: async ({ request }) => {
                await requireAdmin(request)

                try {
                    const body = await request.json()
                    const parsed = newCourseSchema.safeParse(body)
                    if (!parsed.success) {
                        return Response.json(
                            { error: 'Validation failed', issues: parsed.error.issues },
                            { status: 400 },
                        )
                    }
                    const course = await courseService.create(parsed.data)
                    return Response.json(course, { status: 201 })
                } catch (err) {
                    return Response.json({ error: 'Internal server error' }, { status: 500 })
                }
            },
        },
    },
})