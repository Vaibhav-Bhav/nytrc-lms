ADD THE FOLLOWING TO THE EXISTING LMS FRONTEND DESIGN

IMPORTANT:

* Do NOT create a new LMS design.
* Do NOT modify the existing design system, colors, typography, spacing, or reusable components.
* These changes are ONLY for the working prototype (Monday Demo) and must remain compatible with the existing LMS architecture and future production requirements.

---

WORKING PROTOTYPE GOAL

The current milestone is to demonstrate the core LMS workflow:

Admin → Create Course → Create Sections → Create Lessons → Upload Video/PDF → Publish Course → Student Dashboard → Open Course → Open Lesson → Watch Video/Open PDF.

The prototype should provide a complete end-to-end user experience while remaining API-ready for future backend integrations.

---

ADMIN MODULE REQUIREMENTS

The Admin module must support the following workflow:

1. Admin Login

2. Admin Dashboard

   * Total Courses
   * Total Students (Optional)
   * Recently Published Courses (Optional)

3. Create Course

   * Course Title
   * Course Description
   * Course Thumbnail
   * Course Status (Draft / Published)
   * Create Course Button

4. Create Sections

   * Section Name
   * Section Description (Optional)
   * Section Order
   * Add Section Button

5. Create Lessons

   * Lesson Title
   * Lesson Description
   * Lesson Order
   * Lesson Status

6. Upload Content

   * Upload Video
   * Upload PDF
   * Replace Uploaded File
   * Delete Uploaded File
   * Upload Progress Indicator
   * Upload Success State
   * Upload Failed State
   * Retry Upload Button

7. Publish Course

   * Publish Confirmation Modal
   * Successfully Published State
   * Edit Course
   * Unpublish Course (Optional)

---

COURSE ARCHITECTURE

The frontend MUST follow the following architecture:

Course
↓
Sections
↓
Lessons
↓
Video / PDF
↓
Student Access

IMPORTANT:

* Do NOT upload videos or PDFs directly inside a course.
* Every course must contain Sections.
* Every Section must contain Lessons.
* Every Lesson can contain Video content or PDF content.

---

STUDENT MODULE REQUIREMENTS

The Student module must support:

1. Student Login

2. Student Dashboard

   * My Courses
   * Continue Learning
   * Course Progress Indicator
   * Course Thumbnail
   * Course Description

3. Course Details Page

   * Course Information
   * Available Sections
   * Lesson Count
   * Course Progress

4. Section View

   * View Available Lessons
   * Current Lesson Indicator
   * Completed Lesson Indicator
   * Continue Learning Indicator

5. Lesson Page

   * Lesson Title
   * Lesson Description
   * Video Player
   * PDF Viewer
   * Previous Lesson Button
   * Next Lesson Button

---

VIDEO PLAYER REQUIREMENTS

Include:

* Play / Pause
* Fullscreen Support
* Volume Controls
* Responsive Layout
* Loading State
* Error State

---

PDF VIEWER REQUIREMENTS

Include:

* In-browser PDF Viewing
* Responsive Layout
* Loading State
* Error State
* Download Permission Support (Future Ready)

---

RESPONSIVE REQUIREMENTS

The prototype must support:

* Desktop
* Laptop
* Tablet
* Mobile

Include:

* Responsive Sidebar Navigation
* Responsive Lesson Navigation
* Responsive Video Player
* Responsive PDF Viewer
* Adaptive Dashboard Layouts
* Mobile Friendly Components

---

REUSABLE COMPONENT REQUIREMENTS

Reuse the existing component system.

Include:

* Course Card
* Section Card
* Lesson Card
* Upload Component
* Loading Components
* Error Components
* Confirmation Modals
* Navigation Components
* Progress Components
* Generic Empty State Components

IMPORTANT:
Do NOT create duplicate components.

---

API READY REQUIREMENTS

The frontend must remain API-ready.

Prepare components assuming future APIs such as:

GET:

* /courses
* /courses/:id
* /sections/:id
* /lessons/:id

POST:

* /admin/courses
* /admin/sections
* /admin/lessons
* /admin/upload-video
* /admin/upload-pdf

PUT:

* /admin/update-course
* /admin/update-lesson

DELETE:

* /admin/delete-course
* /admin/delete-lesson

IMPORTANT:
Do NOT hardcode any course information.

Every component should support receiving API responses dynamically.

---

LOADING, EMPTY & ERROR STATES

Every screen must support:

* Loading State
* Empty State
* Success State
* Error State
* Retry State

Examples:

* Upload Failed
* Course Not Found
* Video Failed to Load
* PDF Failed to Load
* Network Failure
* Empty Dashboard
* No Lessons Available

---

IMPORTANT FOR THE MONDAY DEMO

ONLY BUILD THE FOLLOWING CORE LMS FLOW:

Admin:

* Login
* Create Course
* Create Sections
* Create Lessons
* Upload Video
* Upload PDF
* Publish Course

Student:

* Login
* Dashboard
* Open Course
* View Sections
* Open Lesson
* Watch Video
* Read PDF

---

DO NOT BUILD IN THIS MILESTONE

* Razorpay Integration
* Invoice System
* Refund System
* Email Services
* Notification System
* Analytics Dashboard
* Certificate Generation
* Quiz System
* Payment Workflows

These features will be implemented in future milestones.

---

FINAL CONSTRAINTS

* Maintain complete UI consistency with the existing LMS design.
* Follow the existing design tokens and reusable component system.
* Maintain API-ready frontend components.
* Maintain complete compatibility with the backend architecture.
* Build only the working LMS prototype required for the current milestone.
* The final deliverable should successfully demonstrate the complete workflow:

Admin → Create Course → Create Sections → Create Lessons → Upload Video/PDF → Publish Course → Student Dashboard → Open Course → Open Lesson → Watch Video/Open PDF.

The prototype should feel like a production-ready LMS foundation that can seamlessly scale into the complete LMS in future milestones without requiring major architectural changes.