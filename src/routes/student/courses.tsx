import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { StudentCourses } from '@/app/screens/student/StudentCourses'
import { Screen } from '@/data/types'

function StudentCoursesRoute() {
  const navigate = useNavigate()

  function handleNavigate(screen: Screen) {
    const map: Partial<Record<Screen, string>> = {
      'login': '/login',
      'student-dashboard': '/student/dashboard',
      'student-course-detail': '/student/course',
      'course-player': '/student/course',
    }
    const route = map[screen]
    if (route) navigate({ to: route as '/' })
    else console.warn(`[StudentCourses] "${screen}" not yet mapped.`)
  }

  return <StudentCourses onNavigate={handleNavigate} onSelectCourse={(id) => navigate({ to: '/student/course', search: { id } as never })} />
}

export const Route = createFileRoute('/student/courses')({
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
  component: StudentCoursesRoute,
})
