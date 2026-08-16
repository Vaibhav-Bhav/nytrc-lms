import { fetchCurrentUser } from '@/hooks/useAuth';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { StudentCourses } from '@/app/screens/student/StudentCourses'
import { Screen } from '@/data/types'

function StudentCoursesRoute() {
  const navigate = useNavigate()

  function handleNavigate(screen: Screen, params?: { courseId?: string; lessonId?: string }) {
    if (screen === 'login') { navigate({ to: '/login' }); return }
    if (screen === 'student-dashboard') { navigate({ to: '/student/dashboard' }); return }
    if (screen === 'student-course-detail' || screen === 'course-player') {
      navigate({ to: '/student/course', search: { id: params?.courseId } as never })
      return
    }
    console.warn(`[StudentCourses] "${screen}" not mapped.`)
  }

  return <StudentCourses onNavigate={handleNavigate} onSelectCourse={(id) => navigate({ to: '/student/course', search: { id } as never })} />
}

export const Route = createFileRoute('/student/courses')({
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
  component: StudentCoursesRoute,
})
