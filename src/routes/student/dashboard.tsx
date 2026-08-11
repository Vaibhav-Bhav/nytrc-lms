import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { StudentDashboard } from '@/app/screens/student/StudentDashboard'
import { StudentCourses } from '@/app/screens/student/StudentCourses'
import { StudentCourseDetail } from '@/app/screens/student/StudentCourseDetail'
import { StudentAccount } from '@/app/screens/student/StudentAccount'
import { CoursePlayer } from '@/app/screens/student/CoursePlayer'
import { Screen } from '@/data/types'

export const Route = createFileRoute('/student/dashboard')({
  component: StudentDashboardRoute,
})

function StudentDashboardRoute() {
  const navigate = useNavigate()
  const [activeScreen, setActiveScreen] = useState<Screen>('student-dashboard')
  const [selectedCourseId, setSelectedCourseId] = useState<string>('c_1')

  function handleNavigate(screen: Screen) {
    if (screen === 'login') {
      navigate({ to: '/login' })
      return
    }
    if (screen === 'auth-device-limit-exceeded') {
      navigate({ to: '/device-limit' })
      return
    }
    setActiveScreen(screen)
  }

  function handleSelectCourse(id: string) {
    setSelectedCourseId(id)
  }

  if (activeScreen === 'student-courses') {
    return <StudentCourses onNavigate={handleNavigate} onSelectCourse={handleSelectCourse} />
  }

  if (activeScreen === 'student-course-detail') {
    return <StudentCourseDetail onNavigate={handleNavigate} selectedCourseId={selectedCourseId} />
  }

  if (activeScreen === 'student-account') {
    return <StudentAccount onNavigate={handleNavigate} />
  }

  if (activeScreen === 'course-player') {
    return <CoursePlayer onNavigate={handleNavigate} selectedCourseId={selectedCourseId} />
  }

  return <StudentDashboard onNavigate={handleNavigate} onSelectCourse={handleSelectCourse} />
}
