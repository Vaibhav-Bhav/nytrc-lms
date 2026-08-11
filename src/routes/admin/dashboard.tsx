import { useState } from 'react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { AdminDashboard } from '@/app/screens/admin/AdminDashboard'
import { AdminContent } from '@/app/screens/admin/AdminContent'
import { AdminCreateCourse } from '@/app/screens/admin/AdminCreateCourse'
import { AdminStudents } from '@/app/screens/admin/AdminStudents'
import { AdminStudentDetail } from '@/app/screens/admin/AdminStudentDetail'
import { AdminPaymentHistory } from '@/app/screens/admin/AdminPaymentHistory'
import { AdminRefundFlow } from '@/app/screens/admin/AdminRefundFlow'
import { AdminEmailLog } from '@/app/screens/admin/AdminEmailLog'
import { Screen } from '@/data/types'

export const Route = createFileRoute('/admin/dashboard')({
  beforeLoad: async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' })

      // Not authenticated — redirect to login
      if (res.status === 401) {
        throw redirect({ to: '/login' })
      }

      if (!res.ok) {
        // Unexpected server error — fail safe to login
        throw redirect({ to: '/login' })
      }

      const data = await res.json()
      const user = data?.user

      // Wrong role — redirect to login
      if (!user || user.role !== 'admin') {
        throw redirect({ to: '/login' })
      }

      if (user.force_password_change) {
        throw redirect({ to: '/force-password' })
      }

      // Return user so it is available in route context
      return { user }
    } catch (err) {
      // Re-throw TanStack redirects as-is
      if (err instanceof Response || (err as any)?.isRedirect) throw err
      // Network error — redirect to login
      throw redirect({ to: '/login' })
    }
  },
  component: AdminDashboardRoute,
})

function AdminDashboardRoute() {
  const navigate = useNavigate()
  const [activeScreen, setActiveScreen] = useState<Screen>('admin-dashboard')
  const [selectedStudentId, setSelectedStudentId] = useState<string>('s1')
  const [selectedCourseId, setSelectedCourseId] = useState<string>('c1')

  function handleNavigate(screen: Screen) {
    const map: Partial<Record<Screen, string>> = {
      'login': '/login',
      'auth-device-session': '/admin/dashboard',
      'auth-device-limit-exceeded': '/device-limit',
    }

    const route = map[screen]
    if (route) {
      navigate({ to: route as '/' })
    } else {
      setActiveScreen(screen)
    }
  }

  function handleSelectStudent(id: string) {
    setSelectedStudentId(id)
    setActiveScreen('admin-student-detail')
  }

  function handleSelectCourse(id: string) {
    setSelectedCourseId(id)
    setActiveScreen('admin-content')
  }

  if (activeScreen === 'admin-content') {
    return <AdminContent onNavigate={handleNavigate} selectedCourseId={selectedCourseId} onSelectCourse={handleSelectCourse} />
  }

  if (activeScreen === 'admin-create-course') {
    return <AdminCreateCourse onNavigate={handleNavigate} />
  }

  if (activeScreen === 'admin-students') {
    return <AdminStudents onNavigate={handleNavigate} onSelectStudent={handleSelectStudent} />
  }

  if (activeScreen === 'admin-student-detail') {
    return (
      <AdminStudentDetail
        onNavigate={handleNavigate}
        studentId={selectedStudentId}
      />
    )
  }

  if (activeScreen === 'admin-payment-history') {
    return <AdminPaymentHistory onNavigate={handleNavigate} />
  }

  if (activeScreen === 'admin-refund') {
    return <AdminRefundFlow onNavigate={handleNavigate} />
  }

  if (activeScreen === 'admin-email-log') {
    return <AdminEmailLog onNavigate={handleNavigate} />
  }

  return <AdminDashboard />
}
