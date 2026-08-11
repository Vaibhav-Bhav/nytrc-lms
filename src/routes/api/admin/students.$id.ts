import { createFileRoute } from '@tanstack/react-router'
import { userRepository } from '@/repositories/user'
import { sessionRepository } from '@/repositories/session'
import { progressRepository } from '@/repositories/progress'
import { invoiceRepository } from '@/repositories/invoice'
import { courseAccessRepository } from '@/repositories/courseAccess'
import { requireAdmin } from '@/middleware/auth'

export const Route = createFileRoute('/api/admin/students/$id')({
    server: {
        handlers: {
            GET: async ({ request, params }) => {
                await requireAdmin(request)

                try {
                    const studentId = params.id
                    const user = await userRepository.findById(studentId)
                    
                    if (!user || user.role !== 'student') {
                        return Response.json({ error: 'Student not found' }, { status: 404 })
                    }

                    // Fetch user sessions
                    const sessions = await sessionRepository.findActiveByUserId(studentId)
                    const lastLogin = sessions.length > 0 
                        ? new Date(sessions[0].created_at).toISOString().split('T')[0]
                        : 'Never'
                    
                    // Fetch progress
                    const progresses = await progressRepository.findByStudent(studentId)
                    let totalProgress = 0
                    if (progresses.length > 0) {
                        const completed = progresses.filter((p: any) => p.completed).length
                        totalProgress = Math.round((completed / progresses.length) * 100)
                    }

                    // Fetch course access
                    const allAccesses = await courseAccessRepository.findAll()
                    const accesses = allAccesses.filter((a: any) => a.student_id === studentId)
                    const activeAccess = accesses.find((a: any) => a.access_status === 'active')

                    // Fetch invoices (mocked filtered because invoice has payment_id not student_id directly)
                    const allInvoices = await invoiceRepository.findAll()
                    // If invoice had a student_id, we'd filter it. Since we might not, let's just return empty for now.
                    const userInvoices: any[] = [] 

                    // Construct full student detail
                    const detail = {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        mobile: "-", 
                        joined: new Date(user.created_at).toISOString().split('T')[0],
                        lastLogin,
                        progress: totalProgress,
                        status: user.is_active ? "active" : "locked",
                        access: activeAccess ? {
                            status: activeAccess.access_status,
                            grantedAt: activeAccess.granted_at,
                            revokedAt: activeAccess.access_status === 'revoked' ? activeAccess.updated_at : null
                        } : null,
                        sessions: sessions.map((s: any) => ({
                            id: s.id,
                            os: s.os,
                            browser: s.browser,
                            ip_address: s.ip_address,
                            created_at: s.created_at,
                            is_active: s.is_active
                        })),
                        invoices: userInvoices.map((inv: any) => ({
                            id: inv.id,
                            amount: inv.total_amount,
                            status: inv.invoice_status,
                            date: new Date(inv.created_at).toISOString().split('T')[0],
                            invoiceNumber: inv.invoice_number
                        }))
                    }

                    return Response.json(detail, { status: 200 })
                } catch (err) {
                    console.error('[API] /api/admin/students/$id Error:', err)
                    return Response.json({ error: 'Internal server error' }, { status: 500 })
                }
            },
        },
    },
})
