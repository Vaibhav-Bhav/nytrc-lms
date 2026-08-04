import { Course, Section, Lesson, Student, PaymentInvoice, StudentDetailApiResponse, StudentSessionsApiResponse, StudentPaymentsApiResponse } from "../data/types";
import { INITIAL_COURSES, INITIAL_SECTIONS, INITIAL_LESSONS, INITIAL_STUDENTS, PAYMENT_HISTORY } from "../data/mockData";
import { sessionService } from "./sessionService";

const STORAGE_KEYS = {
  COURSES: "lms_courses_data",
  SECTIONS: "lms_sections_data",
  LESSONS: "lms_lessons_data",
  STUDENTS: "lms_students_data",
};

function loadStorage<T>(key: string, initial: T[]): T[] {
  if (typeof window === "undefined") return [...initial];
  try {
    const item = localStorage.getItem(key);
    if (item) {
      return JSON.parse(item);
    }
  } catch (e) {
    console.error("Failed to read from localStorage:", key, e);
  }
  return [...initial];
}

function saveStorage<T>(key: string, data: T[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to write to localStorage:", key, e);
  }
}

// Stateful arrays initialized from localStorage (or seed mock data)
let coursesStore: Course[] = loadStorage(STORAGE_KEYS.COURSES, INITIAL_COURSES);
let sectionsStore: Section[] = loadStorage(STORAGE_KEYS.SECTIONS, INITIAL_SECTIONS);
let lessonsStore: Lesson[] = loadStorage(STORAGE_KEYS.LESSONS, INITIAL_LESSONS);
let studentsStore: Student[] = loadStorage(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);

const delay = (ms: number = 200) => new Promise((resolve) => setTimeout(resolve, ms));

export const lmsService = {
  // Course API
  async getCourses(): Promise<Course[]> {
    await delay(150);
    return coursesStore.map((c) => {
      const courseSections = sectionsStore.filter((s) => s.courseId === c.id);
      const sectionIds = courseSections.map((s) => s.id);
      const courseLessons = lessonsStore.filter((l) => sectionIds.includes(l.sectionId));
      return {
        ...c,
        sectionCount: courseSections.length,
        lessonCount: courseLessons.length,
      };
    });
  },

  async getCourseById(id: string): Promise<Course | null> {
    await delay(150);
    const course = coursesStore.find((c) => c.id === id);
    if (!course) return null;

    const courseSections = sectionsStore.filter((s) => s.courseId === course.id);
    const sectionIds = courseSections.map((s) => s.id);
    const courseLessons = lessonsStore.filter((l) => sectionIds.includes(l.sectionId));

    return {
      ...course,
      sectionCount: courseSections.length,
      lessonCount: courseLessons.length,
    };
  },

  async createCourse(data: { title: string; description: string; instructor?: string; status?: "draft" | "published"; thumbnail?: string }): Promise<Course> {
    await delay(300);
    const newCourse: Course = {
      id: `c_${Date.now()}`,
      title: data.title,
      description: data.description,
      instructor: data.instructor || "Dr. Maya Patel",
      thumbnail: data.thumbnail,
      status: data.status || "draft",
      sectionCount: 0,
      lessonCount: 0,
      studentCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };
    coursesStore.push(newCourse);
    saveStorage(STORAGE_KEYS.COURSES, coursesStore);
    return newCourse;
  },

  async publishCourse(id: string): Promise<Course> {
    await delay(300);
    const index = coursesStore.findIndex((c) => c.id === id);
    if (index === -1) throw new Error("Course not found");
    coursesStore[index] = { ...coursesStore[index], status: "published" };
    saveStorage(STORAGE_KEYS.COURSES, coursesStore);
    return coursesStore[index];
  },

  async deleteCourse(id: string): Promise<void> {
    await delay(300);
    coursesStore = coursesStore.filter((c) => c.id !== id);
    saveStorage(STORAGE_KEYS.COURSES, coursesStore);

    const relatedSectionIds = sectionsStore.filter((s) => s.courseId === id).map((s) => s.id);
    sectionsStore = sectionsStore.filter((s) => s.courseId !== id);
    saveStorage(STORAGE_KEYS.SECTIONS, sectionsStore);

    lessonsStore = lessonsStore.filter((l) => !relatedSectionIds.includes(l.sectionId));
    saveStorage(STORAGE_KEYS.LESSONS, lessonsStore);
  },

  // Section API
  async getSectionsByCourse(courseId: string): Promise<Section[]> {
    await delay(150);
    const sections = sectionsStore
      .filter((s) => s.courseId === courseId)
      .sort((a, b) => a.order - b.order);

    return sections.map((sec) => ({
      ...sec,
      lessons: lessonsStore
        .filter((l) => l.sectionId === sec.id)
        .sort((a, b) => a.order - b.order),
    }));
  },

  async createSection(courseId: string, data: { title: string; description?: string }): Promise<Section> {
    await delay(300);
    const existing = sectionsStore.filter((s) => s.courseId === courseId);
    const newSection: Section = {
      id: `s_${Date.now()}`,
      courseId,
      title: data.title,
      order: existing.length + 1,
      published: false,
      lessons: [],
    };
    sectionsStore.push(newSection);
    saveStorage(STORAGE_KEYS.SECTIONS, sectionsStore);

    // Update section count on course
    const cIdx = coursesStore.findIndex((c) => c.id === courseId);
    if (cIdx !== -1) {
      coursesStore[cIdx].sectionCount = (coursesStore[cIdx].sectionCount || 0) + 1;
      saveStorage(STORAGE_KEYS.COURSES, coursesStore);
    }

    return newSection;
  },

  async toggleSectionPublished(sectionId: string): Promise<Section> {
    await delay(200);
    const sIdx = sectionsStore.findIndex((s) => s.id === sectionId);
    if (sIdx === -1) throw new Error("Section not found");
    sectionsStore[sIdx].published = !sectionsStore[sIdx].published;
    saveStorage(STORAGE_KEYS.SECTIONS, sectionsStore);
    return sectionsStore[sIdx];
  },

  // Lesson API
  async getLessonsBySection(sectionId: string): Promise<Lesson[]> {
    await delay(150);
    return lessonsStore.filter((l) => l.sectionId === sectionId).sort((a, b) => a.order - b.order);
  },

  async createLesson(sectionId: string, data: { title: string; type: "video" | "pdf"; description?: string }): Promise<Lesson> {
    await delay(300);
    const existing = lessonsStore.filter((l) => l.sectionId === sectionId);
    const newLesson: Lesson = {
      id: `l_${Date.now()}`,
      sectionId,
      title: data.title,
      type: data.type,
      order: existing.length + 1,
      status: "draft",
      published: false,
      completed: false,
      locked: false,
      notPublished: false,
      downloadPermission: false,
      allow_download: false,
      duration: data.type === "video" ? "10:00" : null,
      hasDownload: data.type === "pdf",
    };
    lessonsStore.push(newLesson);
    saveStorage(STORAGE_KEYS.LESSONS, lessonsStore);

    // Update lesson count on associated course
    const section = sectionsStore.find((s) => s.id === sectionId);
    if (section) {
      const cIdx = coursesStore.findIndex((c) => c.id === section.courseId);
      if (cIdx !== -1) {
        coursesStore[cIdx].lessonCount = (coursesStore[cIdx].lessonCount || 0) + 1;
        saveStorage(STORAGE_KEYS.COURSES, coursesStore);
      }
    }

    return newLesson;
  },

  async toggleLessonPublished(lessonId: string): Promise<Lesson> {
    await delay(200);
    const lIdx = lessonsStore.findIndex((l) => l.id === lessonId);
    if (lIdx === -1) throw new Error("Lesson not found");
    const nextPub = !lessonsStore[lIdx].published;
    lessonsStore[lIdx].published = nextPub;
    lessonsStore[lIdx].status = nextPub ? "published" : "draft";
    saveStorage(STORAGE_KEYS.LESSONS, lessonsStore);
    return lessonsStore[lIdx];
  },

  async toggleLessonDownloadPermission(lessonId: string): Promise<Lesson> {
    await delay(200);
    const lIdx = lessonsStore.findIndex((l) => l.id === lessonId);
    if (lIdx === -1) throw new Error("Lesson not found");
    const nextVal = !lessonsStore[lIdx].downloadPermission;
    lessonsStore[lIdx].downloadPermission = nextVal;
    lessonsStore[lIdx].allow_download = nextVal;
    lessonsStore[lIdx].hasDownload = nextVal;
    saveStorage(STORAGE_KEYS.LESSONS, lessonsStore);
    return lessonsStore[lIdx];
  },

  async deleteLesson(lessonId: string): Promise<void> {
    await delay(300);
    const lesson = lessonsStore.find((l) => l.id === lessonId);
    lessonsStore = lessonsStore.filter((l) => l.id !== lessonId);
    saveStorage(STORAGE_KEYS.LESSONS, lessonsStore);

    if (lesson) {
      const section = sectionsStore.find((s) => s.id === lesson.sectionId);
      if (section) {
        const cIdx = coursesStore.findIndex((c) => c.id === section.courseId);
        if (cIdx !== -1 && (coursesStore[cIdx].lessonCount || 0) > 0) {
          coursesStore[cIdx].lessonCount! -= 1;
          saveStorage(STORAGE_KEYS.COURSES, coursesStore);
        }
      }
    }
  },

  async publishLesson(lessonId: string): Promise<Lesson> {
    await delay(250);
    const lIdx = lessonsStore.findIndex((l) => l.id === lessonId);
    if (lIdx === -1) throw new Error("Lesson not found");
    lessonsStore[lIdx].published = true;
    lessonsStore[lIdx].status = "published";
    saveStorage(STORAGE_KEYS.LESSONS, lessonsStore);
    return lessonsStore[lIdx];
  },

  // Upload File API (Mock with service layer provider interface for Bunny Stream & Cloudflare R2)
  async uploadFile(file: File, simulateFailure: boolean = false): Promise<{ url: string; fileName: string; fileType: "video" | "pdf" }> {
    await delay(400);
    if (simulateFailure || Math.random() < 0.05) {
      throw new Error("Upload failed due to network interruption. Please try again.");
    }
    const isPdf = file.name.endsWith(".pdf") || file.type.includes("pdf");
    
    // Abstracted Service Layer Return (Designed for easy Bunny Stream / R2 swap)
    return {
      url: isPdf
        ? `https://pub-r2.learnbase.io/docs/${Date.now()}_${file.name}`
        : `https://video.bunnycdn.com/play/${Date.now()}_${file.name}`,
      fileName: file.name,
      fileType: isPdf ? "pdf" : "video",
    };
  },

  // Student APIs
  async getStudents(): Promise<Student[]> {
    await delay(150);
    return [...studentsStore];
  },

  /**
   * GET /admin/students/:studentId
   */
  async getStudentById(studentId: string): Promise<StudentDetailApiResponse | null> {
    await delay(150);
    const student = studentsStore.find((s) => s.id === studentId) || studentsStore[0];
    if (!student) return null;

    const totalLessons = 15;
    const completedLessons = Math.round((student.progress / 100) * totalLessons);

    const fullStudent: Student = {
      ...student,
      courseName: "Modern JavaScript: From Fundamentals to Advanced",
      enrollmentDate: student.joined,
      accessStartDate: student.joined,
      accessEndDate: "2025-11-03",
      completedLessons,
      totalLessons,
      accessStatus: student.status === "locked" ? "locked" : "active",
    };

    return {
      student: fullStudent,
      enrollment: {
        courseName: fullStudent.courseName!,
        enrollmentDate: fullStudent.enrollmentDate!,
        accessStartDate: fullStudent.accessStartDate!,
        accessEndDate: fullStudent.accessEndDate!,
        progress: student.progress,
        completedLessons,
        remainingLessons: totalLessons - completedLessons,
        totalLessons,
        lastLogin: student.lastLogin,
      },
    };
  },

  /**
   * GET /admin/students/:studentId/sessions
   */
  async getStudentSessions(studentId: string): Promise<StudentSessionsApiResponse> {
    await delay(150);
    const sessionData = await sessionService.getSessions();
    return {
      studentId,
      max_devices: sessionData.max_devices,
      active_devices: sessionData.active_devices,
      devices: sessionData.devices,
    };
  },

  /**
   * GET /admin/students/:studentId/payments
   */
  async getStudentPayments(studentId: string): Promise<StudentPaymentsApiResponse> {
    await delay(150);
    return {
      studentId,
      invoices: PAYMENT_HISTORY,
    };
  },

  /**
   * POST /admin/students/:studentId/lock
   */
  async lockStudent(studentId: string): Promise<Student> {
    await delay(200);
    const idx = studentsStore.findIndex((s) => s.id === studentId);
    if (idx === -1) throw new Error("Student not found");
    const nextStatus = studentsStore[idx].status === "locked" ? "active" : "locked";
    studentsStore[idx] = { ...studentsStore[idx], status: nextStatus };
    saveStorage(STORAGE_KEYS.STUDENTS, studentsStore);
    return studentsStore[idx];
  },

  /**
   * DELETE /admin/students/:studentId
   */
  async deleteStudent(studentId: string): Promise<void> {
    await delay(250);
    studentsStore = studentsStore.filter((s) => s.id !== studentId);
    saveStorage(STORAGE_KEYS.STUDENTS, studentsStore);
  },

  async markLessonComplete(lessonId: string): Promise<void> {
    await delay(150);
    const lIdx = lessonsStore.findIndex((l) => l.id === lessonId);
    if (lIdx !== -1) {
      lessonsStore[lIdx].completed = true;
      saveStorage(STORAGE_KEYS.LESSONS, lessonsStore);
    }
  },

  // Helper to reset data back to default mock seeds if needed
  async resetToDefaults(): Promise<void> {
    coursesStore = [...INITIAL_COURSES];
    sectionsStore = [...INITIAL_SECTIONS];
    lessonsStore = [...INITIAL_LESSONS];
    studentsStore = [...INITIAL_STUDENTS];
    saveStorage(STORAGE_KEYS.COURSES, coursesStore);
    saveStorage(STORAGE_KEYS.SECTIONS, sectionsStore);
    saveStorage(STORAGE_KEYS.LESSONS, lessonsStore);
    saveStorage(STORAGE_KEYS.STUDENTS, studentsStore);
  },
};
