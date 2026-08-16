import { fetchCurrentUser } from '@/hooks/useAuth';
import { useState } from 'react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { StudentDashboard } from '@/app/screens/student/StudentDashboard'
import { StudentCourses } from '@/app/screens/student/StudentCourses'
import { StudentCourseDetail } from '@/app/screens/student/StudentCourseDetail'
import { StudentAccount } from '@/app/screens/student/StudentAccount'
import { CoursePlayer } from '@/app/screens/student/CoursePlayer'
import { Screen } from '@/data/types'

export const Route = createFileRoute('/student/dashboard')({
  beforeLoad: async ({ context }) => {
  if (typeof window === 'undefined') return; // Skip auth redirect on server

    try {
      const user = await context.queryClient.fetchQuery({
        queryKey: ['auth', 'me'],
        queryFn: fetchCurrentUser, 
      });
      if (!user || user.role !== 'student') throw redirect({ to: '/login' });
      if (user.force_password_change) throw redirect({ to: '/force-password' });
    } catch (error) {
      if (error instanceof Error && error.message !== 'Failed to fetch current user') {
        throw redirect({ to: '/login' });
      }
      throw redirect({ to: '/login' });
    }
  },
  component: StudentDashboardRoute,
})

function StudentDashboardRoute() {
  const navigate = useNavigate()
  const [activeScreen, setActiveScreen] = useState<Screen>('student-dashboard')
  const [selectedCourseId, setSelectedCourseId] = useState<string>('c_1')
  const [selectedLessonId, setSelectedLessonId] = useState<string | undefined>(undefined)

  function handleNavigate(screen: Screen, params?: any) {
    if (screen === 'login') {
      navigate({ to: '/login' })
      return
    }
    if (screen === 'auth-device-limit-exceeded') {
      navigate({ to: '/device-limit' })
      return
    }
    if (params?.courseId) setSelectedCourseId(params.courseId)
    setSelectedLessonId(params?.lessonId)
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
    return <CoursePlayer onNavigate={handleNavigate} selectedCourseId={selectedCourseId} selectedLessonId={selectedLessonId} />
  }

  return <StudentDashboard />
}
