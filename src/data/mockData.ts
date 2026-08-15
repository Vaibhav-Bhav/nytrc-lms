import { Course, Section, Lesson, Student, PaymentInvoice, EmailLogEntry, DeviceSession } from "./types";

export const INITIAL_COURSES: Course[] = [
  {
    id: "c1",
    title: "Modern JavaScript: From Fundamentals to Advanced",
    description: "Master JavaScript from core fundamentals to advanced patterns, async programming, closures, prototypes, and real-world project architecture.",
    instructor: "Dr. Maya Patel",
    status: "published",
    sectionCount: 4,
    lessonCount: 15,
    studentCount: 8,
    createdAt: "2024-10-15",
  },
];

export const INITIAL_SECTIONS: Section[] = [
  { id: "s1", courseId: "c1", title: "Getting Started", order: 1, published: true },
  { id: "s2", courseId: "c1", title: "Core Concepts", order: 2, published: true },
  { id: "s3", courseId: "c1", title: "Advanced Topics", order: 3, published: false },
  { id: "s4", courseId: "c1", title: "Practical Projects", order: 4, published: true },
];

export const INITIAL_LESSONS: Lesson[] = [
  { id: "l1", sectionId: "s1", title: "Introduction & Setup", type: "video", mediaUrl: "https://example.com/videos/intro.mp4", order: 1, status: "published", published: true, duration: "8:32", completed: true, locked: false, notPublished: false, downloadPermission: false },
  { id: "l2", sectionId: "s1", title: "Course Overview", type: "video", mediaUrl: "https://example.com/videos/overview.mp4", order: 2, status: "published", published: true, duration: "5:14", completed: true, locked: false, notPublished: false, downloadPermission: false },
  { id: "l3", sectionId: "s1", title: "JavaScript History", type: "video", mediaUrl: "https://example.com/videos/history.mp4", order: 3, status: "draft", published: false, duration: "12:05", completed: true, locked: false, notPublished: false, downloadPermission: false },

  { id: "l4", sectionId: "s2", title: "Variables & Data Types", type: "video", mediaUrl: "https://example.com/videos/variables.mp4", order: 1, status: "published", published: true, duration: "18:44", completed: true, locked: false, notPublished: false, downloadPermission: false },
  { id: "l5", sectionId: "s2", title: "Functions & Scope", type: "video", mediaUrl: "https://example.com/videos/functions.mp4", order: 2, status: "published", published: true, duration: "22:11", completed: true, locked: false, notPublished: false, downloadPermission: false },
  { id: "l6", sectionId: "s2", title: "Core Concepts Reference", type: "pdf", mediaUrl: "https://example.com/docs/core-concepts.pdf", order: 3, status: "published", published: true, duration: null, completed: true, locked: false, notPublished: false, downloadPermission: true, hasDownload: true },
  { id: "l7", sectionId: "s2", title: "Arrays & Objects", type: "video", mediaUrl: "https://example.com/videos/arrays.mp4", order: 4, status: "published", published: true, duration: "25:30", completed: true, locked: false, notPublished: false, downloadPermission: false },
  { id: "l8", sectionId: "s2", title: "Closures & Async/Await", type: "video", mediaUrl: "https://example.com/videos/closures.mp4", order: 5, status: "published", published: true, duration: "28:45", completed: true, locked: false, notPublished: false, downloadPermission: false },

  { id: "l9", sectionId: "s3", title: "Prototypes & Classes", type: "video", mediaUrl: "https://example.com/videos/prototypes.mp4", order: 1, status: "draft", published: false, duration: "31:15", completed: false, locked: false, notPublished: false, downloadPermission: false },
  { id: "l10", sectionId: "s3", title: "Design Patterns", type: "video", mediaUrl: "https://example.com/videos/patterns.mp4", order: 2, status: "draft", published: false, duration: "24:00", completed: false, locked: false, notPublished: false, downloadPermission: false },
  { id: "l11", sectionId: "s3", title: "Advanced Patterns PDF", type: "pdf", mediaUrl: "https://example.com/docs/advanced-patterns.pdf", order: 3, status: "draft", published: false, duration: null, completed: false, locked: false, notPublished: false, downloadPermission: false, hasDownload: false },
  { id: "l12", sectionId: "s3", title: "Performance & Memory", type: "video", mediaUrl: "https://example.com/videos/performance.mp4", order: 4, status: "draft", published: false, duration: "35:20", completed: false, locked: false, notPublished: true, downloadPermission: false },

  { id: "l13", sectionId: "s4", title: "Building a Task Manager", type: "video", mediaUrl: "https://example.com/videos/task-manager.mp4", order: 1, status: "published", published: true, duration: "45:00", completed: false, locked: true, notPublished: false, downloadPermission: false },
  { id: "l14", sectionId: "s4", title: "API Integration Project", type: "video", mediaUrl: "https://example.com/videos/api-integration.mp4", order: 2, status: "published", published: true, duration: "38:10", completed: false, locked: true, notPublished: false, downloadPermission: false },
  { id: "l15", sectionId: "s4", title: "Final Project Brief", type: "pdf", mediaUrl: "https://example.com/docs/final-project.pdf", order: 3, status: "published", published: true, duration: null, completed: false, locked: true, notPublished: false, downloadPermission: true, hasDownload: true },
];

export const INITIAL_STUDENTS: Student[] = [
  { id: "s1", name: "Sarah Chen", email: "sarah.chen@example.com", mobile: "+1 (415) 555-0182", joined: "2024-11-03", lastLogin: "2024-12-28", progress: 78, status: "active" },
  { id: "s2", name: "Marcus Williams", email: "m.williams@example.com", mobile: "+1 (312) 555-0291", joined: "2024-11-05", lastLogin: "2024-12-27", progress: 45, status: "active" },
  { id: "s3", name: "Priya Sharma", email: "priya.s@example.com", mobile: "+44 7700 900234", joined: "2024-11-08", lastLogin: "2024-12-26", progress: 92, status: "active" },
  { id: "s4", name: "James O'Brien", email: "j.obrien@example.com", mobile: "+1 (617) 555-0143", joined: "2024-11-12", lastLogin: "2024-12-20", progress: 33, status: "active" },
  { id: "s5", name: "Yuki Tanaka", email: "ytanaka@example.com", mobile: "+81 90-1234-5678", joined: "2024-11-15", lastLogin: "2024-12-18", progress: 12, status: "active" },
  { id: "s6", name: "Fatima Al-Hassan", email: "f.alhassan@example.com", mobile: "+971 50 555 1234", joined: "2024-11-20", lastLogin: "2024-11-30", progress: 8, status: "locked" },
  { id: "s7", name: "Diego Ramirez", email: "dramirez@example.com", mobile: "+1 (305) 555-0167", joined: "2024-11-22", lastLogin: "2024-12-25", progress: 56, status: "active" },
  { id: "s8", name: "Ananya Krishnan", email: "ananya.k@example.com", mobile: "+91 98765 43210", joined: "2024-11-25", lastLogin: "2024-12-22", progress: 71, status: "active" },
];

export const PAYMENT_HISTORY: PaymentInvoice[] = [
  {
    id: "inv-001",
    date: "2024-11-03",
    amount: "₹14,750",
    status: "paid",
    invoice: "NYTRC-2024-1047",
    invoiceNumber: "NYTRC-2024-1047",
    customerName: "Student Account",
    customerEmail: "student@example.com",
    customerMobile: "+91 98765 43210",
    customerState: "Maharashtra",
    subtotalAmount: 12500,
    cgstAmount: 1125,
    sgstAmount: 1125,
    igstAmount: 0,
    totalAmount: 14750,
    paymentId: "pay_RzP91823749",
    orderId: "order_RzO8837192",
    hsnCode: "999299",
    gstin: "27AAAAA0000A1Z5",
    downloadUrl: "https://example.com/api/invoices/NYTRC-2024-1047/download",
  },
  {
    id: "inv-000",
    date: "2024-10-01",
    amount: "₹0.00",
    status: "refunded",
    invoice: "NYTRC-2024-1001",
    invoiceNumber: "NYTRC-2024-1001",
    customerName: "Student Account",
    customerEmail: "student@example.com",
    customerMobile: "+91 98765 43210",
    customerState: "Maharashtra",
    subtotalAmount: 12500,
    cgstAmount: 1125,
    sgstAmount: 1125,
    igstAmount: 0,
    totalAmount: 14750,
    paymentId: "pay_RzP00000000",
    orderId: "order_RzO0000000",
    hsnCode: "999299",
    gstin: "27AAAAA0000A1Z5",
    downloadUrl: "https://example.com/api/invoices/NYTRC-2024-1001/download",
  },
];

export const EMAIL_LOG: EmailLogEntry[] = [
  { id: "e1", type: "Welcome Email", sent: "2024-11-03 09:14", status: "delivered" },
  { id: "e2", type: "Login Credentials", sent: "2024-11-03 09:14", status: "delivered" },
  { id: "e3", type: "Password Reset", sent: "2024-11-22 14:30", status: "delivered" },
  { id: "e4", type: "Course Access Reminder", sent: "2024-12-01 10:00", status: "failed" },
];

export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jammu & Kashmir", "Jharkhand", "Karnataka",
  "Kerala", "Ladakh", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

export const DEVICE_SESSIONS: DeviceSession[] = [
  {
    id: "dev_win_laptop_01",
    device_name: "Windows Laptop",
    browser: "Chrome",
    os: "Windows 11",
    login_time: "Today, 10:00 AM",
    last_active: "Just now",
    is_current_device: true,
    status: "active",
    type: "desktop",
    location: "Mumbai, Maharashtra",
    name: "Windows Laptop",
    current: true,
    lastActive: "Just now",
  },
  {
    id: "dev_android_mob_02",
    device_name: "Android Mobile",
    browser: "Chrome",
    os: "Android 14",
    login_time: "Today, 08:30 AM",
    last_active: "15 mins ago",
    is_current_device: false,
    status: "active",
    type: "mobile",
    location: "Mumbai, Maharashtra",
    name: "Android Mobile",
    current: false,
    lastActive: "15 mins ago",
  },
  {
    id: "dev_macbook_03",
    device_name: "MacBook Pro",
    browser: "Safari",
    os: "macOS Sequoia",
    login_time: "Yesterday, 04:15 PM",
    last_active: "2 days ago",
    is_current_device: false,
    status: "expired",
    type: "desktop",
    location: "Delhi, India",
    name: "MacBook Pro",
    current: false,
    lastActive: "2 days ago",
  },
];
