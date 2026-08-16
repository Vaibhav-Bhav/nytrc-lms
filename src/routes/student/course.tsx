import { fetchCurrentUser } from '@/hooks/useAuth';
import { useState } from 'react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { StudentCourseDetail } from '@/app/screens/student/StudentCourseDetail'
import { CoursePlayer } from '@/app/screens/student/CoursePlayer'
import { Screen } from '@/data/types'

function StudentCourseRoute() {
  const navigate = useNavigate()
  const { id: searchCourseId } = Route.useSearch() as { id?: string }

  const [activeScreen, setActiveScreen] = useState<'overview' | 'player'>('overview')
  const [selectedCourseId, setSelectedCourseId] = useState<string | undefined>(searchCourseId)
  const [selectedLessonId, setSelectedLessonId] = useState<string | undefined>(undefined)

  function handleNavigate(screen: Screen, params?: { courseId?: string; lessonId?: string }) {
    if (screen === 'login') { navigate({ to: '/login' }); return }
    if (screen === 'student-dashboard') { navigate({ to: '/student/dashboard' }); return }
    if (screen === 'student-courses') { navigate({ to: '/student/courses' }); return }
    if (screen === 'auth-device-limit-exceeded') { navigate({ to: '/device-limit' }); return }

    if (screen === 'course-player') {
      if (params?.courseId) setSelectedCourseId(params.courseId)
      setSelectedLessonId(params?.lessonId)
      setActiveScreen('player')
      return
    }

    if (screen === 'student-course-detail') {
      setActiveScreen('overview')
      return
    }

    console.warn(`[StudentCourseRoute] "${screen}" not mapped.`)
  }

  if (activeScreen === 'player') {
    return (
      <CoursePlayer
        onNavigate={handleNavigate}
        selectedCourseId={selectedCourseId}
        selectedLessonId={selectedLessonId}
      />
    )
  }

  return (
    <StudentCourseDetail
      onNavigate={handleNavigate}
      selectedCourseId={selectedCourseId}
    />
  )
}

export const Route = createFileRoute('/student/course')({
  validateSearch: (search: Record<string, unknown>) => ({
    id: (search?.id as string) || undefined,
  }),
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
  component: StudentCourseRoute,
})

