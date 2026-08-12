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
  beforeLoad: async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' })
      if (!res.ok) throw redirect({ to: '/login' })
      const data = await res.json()
      if (!data?.user || data.user.role !== 'student') throw redirect({ to: '/login' })
      return { user: data.user }
    } catch (err) {
      if (err instanceof Response || (err as any)?.isRedirect) throw err
      throw redirect({ to: '/login' })
    }
  },
  component: StudentCourseRoute,
})

