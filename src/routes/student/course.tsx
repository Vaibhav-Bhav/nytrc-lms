import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { StudentCourseDetail } from '@/app/screens/student/StudentCourseDetail'
import { Screen } from '@/data/types'

function StudentCourseRoute() {
  const navigate = useNavigate()

  function handleNavigate(screen: Screen) {
    const map: Partial<Record<Screen, string>> = {
      'login': '/login',
      'student-dashboard': '/student/dashboard',
      'student-courses': '/student/courses',
      'course-player': '/student/course',
    }
    const route = map[screen]
    if (route) navigate({ to: route as '/' })
    else console.warn(`[StudentCourse] "${screen}" not yet mapped.`)
  }

  return <StudentCourseDetail onNavigate={handleNavigate} />
}

export const Route = createFileRoute('/student/course')({
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
