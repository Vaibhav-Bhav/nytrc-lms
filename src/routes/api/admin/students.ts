import { createFileRoute } from '@tanstack/react-router'
import { userRepository } from '@/repositories/user'
import { requireAdmin } from '@/middleware/auth'
import { sessionRepository } from '@/repositories/session'

export const Route = createFileRoute('/api/admin/students')({
    server: {
        handlers: {
            GET: async ({ request }) => {
                await requireAdmin(request)

                try {
                    const users = await userRepository.findAll()
                    const students = users.filter((u) => u.role === 'student')

                    // Fetch all sessions to determine lastLogin (simple approach for now)
                    const allSessions = await sessionRepository.findAll()

                    const mapped = students.map((u) => {
                        const userSessions = allSessions
                            .filter((s) => s.user_id === u.id)
                            .sort(
                                (a, b) =>
                                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                            )
                        const lastLogin =
                            userSessions.length > 0
                                ? new Date(userSessions[0].created_at).toISOString().split('T')[0]
                                : 'Never'

                        return {
                            id: u.id,
                            name: u.name,
                            email: u.email,
                            joined: new Date(u.created_at).toISOString().split('T')[0],
                            lastLogin,
                            progress: 0, // Mock progress, backend doesn't track this yet
                            status: u.is_active ? 'active' : 'locked',
                        }
                    })

                    return Response.json(mapped, { status: 200 })
                } catch (err) {
                    console.error('[API] /api/admin/students Error:', err)
                    return Response.json({ error: 'Internal server error' }, { status: 500 })
                }
            },
        },
    },
})
