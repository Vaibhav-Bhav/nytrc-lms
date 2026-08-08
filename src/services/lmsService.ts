import { Course, Section, Lesson, Student, PaymentInvoice } from "../data/types";
import { INITIAL_COURSES, INITIAL_SECTIONS, INITIAL_LESSONS, INITIAL_STUDENTS } from "../data/mockData";

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
    lessonsStore[lIdx].downloadPermission = !lessonsStore[lIdx].downloadPermission;
    lessonsStore[lIdx].hasDownload = lessonsStore[lIdx].downloadPermission;
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

  // Upload File API (Mock with simulated 10% failure rate option)
  async uploadFile(file: File, simulateFailure: boolean = false): Promise<{ url: string; fileName: string; fileType: "video" | "pdf" }> {
    await delay(400);
    if (simulateFailure || Math.random() < 0.1) {
      throw new Error("Upload failed due to network interruption. Please try again.");
    }
    const isPdf = file.name.endsWith(".pdf") || file.type.includes("pdf");
    return {
      url: `https://example.com/uploads/${Date.now()}_${file.name}`,
      fileName: file.name,
      fileType: isPdf ? "pdf" : "video",
    };
  },

  // Student APIs
  async getStudents(): Promise<Student[]> {
    await delay(150);
    return [...studentsStore];
  },

  async markLessonComplete(lessonId: string): Promise<void> {
    await delay(150);
    const lIdx = lessonsStore.findIndex((l) => l.id === lessonId);
    if (lIdx !== -1) {
      lessonsStore[lIdx].completed = true;
      saveStorage(STORAGE_KEYS.LESSONS, lessonsStore);
    }
  },

  // Checkout & Payment APIs (Server route architecture contracts)
  async createCheckoutOrder(data: {
    fullName: string;
    email: string;
    mobile: string;
    state: string;
    courseId: string;
  }): Promise<{
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
    customer: { fullName: string; email: string; mobile: string; state: string };
  }> {
    await delay(300);
    const subtotal = 12500;
    const isSameState = data.state.toLowerCase() === "maharashtra";
    const gstRate = 0.18;
    const gst = Math.round(subtotal * gstRate);
    const total = subtotal + gst;

    const orderId = `order_NYTRC_${Date.now().toString().slice(-6)}`;
    return {
      orderId,
      amount: total * 100, // Amount in paise for Razorpay
      currency: "INR",
      keyId: "rzp_test_NYTRCPortalKeyId", // Public Razorpay Key ID
      customer: data,
    };
  },

  async verifyPayment(data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    customer: { fullName: string; email: string; mobile: string; state: string };
  }): Promise<{
    success: boolean;
    invoice?: PaymentInvoice;
    message?: string;
  }> {
    await delay(500);
    // Server-side HMAC SHA256 signature verification simulation
    if (!data.razorpay_payment_id || !data.razorpay_order_id) {
      return {
        success: false,
        message: "Payment verification failed: Invalid transaction payload signature.",
      };
    }

    const subtotal = 12500;
    const isSameState = data.customer.state.toLowerCase() === "maharashtra";
    const cgst = isSameState ? Math.round(subtotal * 0.09) : 0;
    const sgst = isSameState ? Math.round(subtotal * 0.09) : 0;
    const igst = !isSameState ? Math.round(subtotal * 0.18) : 0;
    const total = subtotal + cgst + sgst + igst;
    const invNum = `NYTRC-2025-${Math.floor(1000 + Math.random() * 9000)}`;

    const newInvoice: PaymentInvoice = {
      id: `inv_${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      amount: `₹${total.toLocaleString("en-IN")}`,
      status: "paid",
      invoice: invNum,
      invoiceNumber: invNum,
      customerName: data.customer.fullName,
      customerEmail: data.customer.email,
      customerMobile: data.customer.mobile,
      customerState: data.customer.state,
      subtotalAmount: subtotal,
      cgstAmount: cgst,
      sgstAmount: sgst,
      igstAmount: igst,
      totalAmount: total,
      paymentId: data.razorpay_payment_id,
      orderId: data.razorpay_order_id,
      hsnCode: "999299",
      gstin: "27AAAAA0000A1Z5",
      downloadUrl: `https://example.com/api/invoices/${invNum}/download`,
    };

    // Auto-create/grant access to student account upon verified payment
    const existingStudentIdx = studentsStore.findIndex((s) => s.email.toLowerCase() === data.customer.email.toLowerCase());
    if (existingStudentIdx !== -1) {
      studentsStore[existingStudentIdx].status = "active";
    } else {
      studentsStore.push({
        id: `s_${Date.now()}`,
        name: data.customer.fullName,
        email: data.customer.email,
        mobile: data.customer.mobile,
        joined: new Date().toISOString().split("T")[0],
        lastLogin: new Date().toISOString().split("T")[0],
        progress: 0,
        status: "active",
      });
      saveStorage(STORAGE_KEYS.STUDENTS, studentsStore);
    }

    return {
      success: true,
      invoice: newInvoice,
    };
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
