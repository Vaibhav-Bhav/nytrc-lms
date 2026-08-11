import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
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
  component: AdminDashboardRoute,
})

function AdminDashboardRoute() {
  const navigate = useNavigate()
  const [activeScreen, setActiveScreen] = useState<Screen>('admin-dashboard')
  const [selectedCourseId, setSelectedCourseId] = useState<string>('c_1')
  const [selectedStudentId, setSelectedStudentId] = useState<string>('s1')

  function handleNavigate(screen: Screen) {
    if (screen === 'login') {
      navigate({ to: '/login' })
      return
    }
    setActiveScreen(screen)
  }

  function handleSelectCourse(id: string) {
    setSelectedCourseId(id)
  }

  function handleSelectStudent(id: string) {
    setSelectedStudentId(id)
  }

  if (activeScreen === 'admin-content') {
    return <AdminContent onNavigate={handleNavigate} selectedCourseId={selectedCourseId} />
  }

  if (activeScreen === 'admin-create-course') {
    return <AdminCreateCourse onNavigate={handleNavigate} />
  }

  if (activeScreen === 'admin-students') {
    return <AdminStudents onNavigate={handleNavigate} onSelectStudent={handleSelectStudent} />
  }

  if (activeScreen === 'admin-student-detail') {
    return <AdminStudentDetail onNavigate={handleNavigate} studentId={selectedStudentId} />
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

  return <AdminDashboard onNavigate={handleNavigate} onSelectCourse={handleSelectCourse} />
}
