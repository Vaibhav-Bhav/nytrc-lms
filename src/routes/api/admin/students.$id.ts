import { createFileRoute } from '@tanstack/react-router'
import { userRepository } from '@/repositories/user'
import { sessionRepository } from '@/repositories/session'
import { progressRepository } from '@/repositories/progress'
import { invoiceRepository } from '@/repositories/invoice'
import { courseAccessRepository } from '@/repositories/courseAccess'
import { requireAdmin } from '@/middleware/auth'
import { createNotification } from '@/services/notification'

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
                    const revokedAccess = accesses.find((a: any) => a.access_status === 'revoked')

                    // Fetch invoices (mocked filtered because invoice has payment_id not student_id directly)
                    const userInvoices: any[] = [] 

                    // Construct full student detail
                    const detail = {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        mobile: user.mobile || "-", 
                        joined: new Date(user.created_at).toISOString().split('T')[0],
                        lastLogin,
                        progress: totalProgress,
                        status: user.is_active ? "active" : "locked",
                        access: (activeAccess || revokedAccess) ? {
                            status: activeAccess ? 'active' : 'revoked',
                            grantedAt: (activeAccess || revokedAccess)?.granted_at,
                            revokedAt: revokedAccess ? revokedAccess.updated_at : null
                        } : {
                            status: user.is_active ? 'active' : 'revoked',
                            grantedAt: new Date(user.created_at).toISOString().split('T')[0],
                            revokedAt: user.is_active ? null : new Date().toISOString()
                        },
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
                    console.error('[API] /api/admin/students/$id GET Error:', err)
                    return Response.json({ error: 'Internal server error' }, { status: 500 })
                }
            },
            PATCH: async ({ request, params }) => {
                await requireAdmin(request)

                try {
                    const studentId = params.id
                    const user = await userRepository.findById(studentId)
                    if (!user) {
                        return Response.json({ error: 'Student not found' }, { status: 404 })
                    }

                    const body = await request.json().catch(() => ({}))
                    const action = body.action || (body.status === 'revoked' ? 'revoke' : 'restore')

                    if (action === 'revoke') {
                        // Deactivate user access
                        await userRepository.update(studentId, { is_active: false })
                        const accesses = await courseAccessRepository.findActiveByStudentId(studentId)
                        for (const acc of accesses) {
                            await courseAccessRepository.update(acc.id, {
                                access_status: 'revoked',
                                revoked_at: new Date().toISOString()
                            })
                        }

                        await createNotification({
                            userId: studentId,
                            targetRole: 'student',
                            title: 'Access Suspended',
                            message: 'Your account access has been suspended by an administrator.',
                            type: 'system',
                            link: '/student/account',
                        }).catch(() => {})

                        await createNotification({
                            targetRole: 'admin',
                            title: 'Student Access Revoked',
                            message: `Access for student ${user.name} (${user.email}) was revoked.`,
                            type: 'system',
                            link: `/admin/students/${studentId}`,
                        }).catch(() => {})

                        return Response.json({ message: 'Student access revoked', status: 'revoked' })
                    } else if (action === 'restore') {
                        await userRepository.update(studentId, { is_active: true })
                        const allAccesses = await courseAccessRepository.findAll()
                        const studentAccesses = allAccesses.filter((a: any) => a.student_id === studentId)
                        for (const acc of studentAccesses) {
                            await courseAccessRepository.update(acc.id, {
                                access_status: 'active',
                                revoked_at: null
                            })
                        }

                        await createNotification({
                            userId: studentId,
                            targetRole: 'student',
                            title: 'Access Restored',
                            message: 'Your account access has been fully restored!',
                            type: 'welcome',
                            link: '/student/courses',
                        }).catch(() => {})

                        await createNotification({
                            targetRole: 'admin',
                            title: 'Student Access Restored',
                            message: `Access for student ${user.name} (${user.email}) was restored.`,
                            type: 'system',
                            link: `/admin/students/${studentId}`,
                        }).catch(() => {})

                        return Response.json({ message: 'Student access restored', status: 'active' })
                    }


                    return Response.json({ error: 'Invalid action' }, { status: 400 })
                } catch (err) {
                    console.error('[API] /api/admin/students/$id PATCH Error:', err)
                    return Response.json({ error: 'Internal server error' }, { status: 500 })
                }
            },
            DELETE: async ({ request, params }) => {
                await requireAdmin(request)

                try {
                    const studentId = params.id
                    const user = await userRepository.findById(studentId)
                    if (!user) {
                        return Response.json({ error: 'Student not found' }, { status: 404 })
                    }

                    // Delete student access records & user permanently
                    const allAccesses = await courseAccessRepository.findAll()
                    const studentAccesses = allAccesses.filter((a: any) => a.student_id === studentId)
                    for (const acc of studentAccesses) {
                        await courseAccessRepository.remove(acc.id)
                    }

                    await userRepository.remove(studentId)

                    return Response.json({ message: 'Student permanently deleted from backend' }, { status: 200 })
                } catch (err) {
                    console.error('[API] /api/admin/students/$id DELETE Error:', err)
                    return Response.json({ error: 'Internal server error' }, { status: 500 })
                }
            },
        },
    },
})
