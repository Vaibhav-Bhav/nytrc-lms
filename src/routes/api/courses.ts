import { createFileRoute } from '@tanstack/react-router'
import { courseService } from '@/services/courses'
import { newCourseSchema } from '@/schemas/courses'

export const Route = createFileRoute('/api/courses')({
  server: {
    handlers: {
      GET: async () => {
        const courses = await courseService.findAll()
        return Response.json(courses)
      },

      POST: async ({ request }) => {
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