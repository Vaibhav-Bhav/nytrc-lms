import { createFileRoute } from '@tanstack/react-router'
import { courseService } from '@/services/courses'
import { newCourseSchema } from '@/schemas/courses'
import { requireAdmin, isAdminRequest } from '@/middleware/auth'

export const Route = createFileRoute('/api/courses')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const isAdmin = await isAdminRequest(request)
        const courses = isAdmin
          ? await courseService.findAll()
          : await courseService.findPublished()
        return Response.json(courses)
      },

      POST: async ({ request }) => {
        await requireAdmin(request)
        const user = (request as any).user
        try {
          const body = await request.json()
          const parsed = newCourseSchema.safeParse({
            ...body,
            created_by: user.id,
          })
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

// import { createFileRoute } from '@tanstack/react-router'

// export const Route = createFileRoute('/api/courses')({
//   server: {
//     handlers: {
//       GET: async () => {
//         return Response.json([{ id: '1', title: 'Test Course', description: 'placeholder' }])
//       },
//     },
//   },
// })