export type Screen =
  | "login" | "force-password" | "forgot-password"
  | "auth-locked" | "auth-session-expired" | "auth-device-session" | "auth-password-changed"
  | "auth-device-limit-exceeded"
  | "checkout"
  | "payment-processing" | "payment-success" | "payment-failed" | "payment-pending"
  | "student-dashboard" | "student-courses" | "course-player" | "student-account"
  | "admin-dashboard" | "admin-create-course" | "admin-content" | "admin-students" | "admin-student-detail" | "admin-refund"
  | "student-course-detail"
  | "skel-dashboard" | "skel-player" | "skel-admin-table"
  | "empty-student" | "empty-admin-students" | "empty-admin-content"
  | "error-content";

export type BadgeVariant =
  | "completed" | "in-progress" | "locked" | "continue-learning" | "access-granted" | "access-locked" | "access-expired"
  | "draft" | "published" | "active" | "pending" | "uploading" | "upload-failed" | "upload-success"
  | "paid" | "failed" | "refunded" | "cancelled" | "delivered"
  | "not-published" | "upcoming" | "access-revoked" | "refund-requested" | "refund-pending" | "refund-complete";

export type PaymentState = "processing" | "paid" | "failed" | "pending" | "cancelled" | "refunded";
export type UploadStage = "idle" | "uploading" | "processing" | "generating" | "ready" | "published" | "failed";

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  thumbnail?: string;
  status: "draft" | "published";
  sectionCount?: number;
  lessonCount?: number;
  studentCount?: number;
  createdAt?: string;
}

export interface Section {
  id: string;
  courseId: string;
  title: string;
  order: number;
  published: boolean;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  sectionId: string;
  title: string;
  type: "video" | "pdf";
  mediaUrl?: string;
  order: number;
  status: "draft" | "published";
  published?: boolean;
  duration?: string | null;
  downloadPermission?: boolean;
  allow_download?: boolean; // API contract naming alignment
  completed?: boolean;
  locked?: boolean;
  notPublished?: boolean;
  hasDownload?: boolean;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  mobile: string;
  joined: string;
  lastLogin: string;
  progress: number;
  status: "active" | "locked";
  courseName?: string;
  enrollmentDate?: string;
  accessStartDate?: string;
  accessEndDate?: string;
  completedLessons?: number;
  totalLessons?: number;
  accessStatus?: "active" | "expired" | "revoked" | "locked";
}

export interface PaymentInvoice {
  id: string;
  date: string;
  amount: string;
  status: "paid" | "refunded" | "cancelled";
  invoice: string;
}

export interface EmailLogEntry {
  id: string;
  type: string;
  sent: string;
  status: "delivered" | "failed";
}

export interface DeviceSession {
  id: string;
  device_name: string;
  browser: string;
  os: string;
  login_time: string;
  last_active: string;
  is_current_device: boolean;
  status: "active" | "expired";
  type: "desktop" | "mobile" | "tablet";
  location?: string;
  // Backward compatibility fields
  name?: string;
  current?: boolean;
  lastActive?: string;
}

export interface SessionApiResponse {
  max_devices: number;
  active_devices: number;
  devices: DeviceSession[];
}

// Backend Contract API Response Shapes
export interface StudentDetailApiResponse {
  student: Student;
  enrollment: {
    courseName: string;
    enrollmentDate: string;
    accessStartDate: string;
    accessEndDate: string;
    progress: number;
    completedLessons: number;
    remainingLessons: number;
    totalLessons: number;
    lastLogin: string;
  };
}

export interface StudentSessionsApiResponse {
  studentId: string;
  max_devices: number;
  active_devices: number;
  devices: DeviceSession[];
}

export interface StudentPaymentsApiResponse {
  studentId: string;
  invoices: PaymentInvoice[];
}
