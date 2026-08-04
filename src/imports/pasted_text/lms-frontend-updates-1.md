ADD THE FOLLOWING TO THE EXISTING LMS FRONTEND DESIGN

IMPORTANT:
These are additional requirements derived from the LMS PRD and implementation considerations. Do NOT remove or modify any existing requirements. The purpose of these additions is to make the frontend more production-ready and simplify frontend–backend integration.

---

1. CHECKOUT PAGE (BEFORE RAZORPAY PAYMENT)

Create a dedicated Checkout Page before Razorpay Checkout is initiated.

The Checkout Page must include:

* Course Information
* Course Price
* Full Name
* Email Address
* Mobile Number
* State Selection (for GST calculations if required)
* Payment Summary
* Terms & Conditions Consent Checkbox
* Privacy Policy Consent Checkbox
* Refund Policy Consent Checkbox
* Proceed to Payment Button

Payment Flow:

Student Login
↓
Checkout Page
↓
Razorpay Checkout
↓
Payment Processing
↓
Payment Verification
↓
Payment Success / Failed / Pending
↓
Course Access Granted
↓
Student Dashboard

IMPORTANT:
The frontend should only handle UI and API-ready interfaces. Razorpay payment verification logic will be handled by the backend.

---

2. LOGIN & AUTHENTICATION STATES

Additionally include the following authentication states:

* Account Locked State
* Temporary Password Expired State
* Session Expired State
* Device Session Management State
* Invalid Credentials State
* Password Successfully Changed State

Include:

* Appropriate error messages.
* Retry functionality.
* Loading states.
* Support contact options where necessary.

---

3. COURSE PLAYER ENHANCEMENTS

Additionally include:

* Last Viewed Lesson State
* Resume Watching Position Indicator
* Lesson Completion Tracking
* Continue Learning State
* Locked Lesson Indicator
* Not Yet Published Lesson Indicator
* Current Lesson Highlighting
* Previous and Next Lesson Navigation

Lesson States:

* Completed
* In Progress
* Locked
* Upcoming
* Not Published
* Continue Learning

---

4. PDF VIEWER PERMISSIONS

The PDF Viewer should support:

Student:

* View Only
* Download Allowed
* Download Restricted

Admin:

* Enable Download
* Disable Download

Frontend should support API-ready permission handling using download access states.

---

5. STUDENT DASHBOARD REQUIREMENTS

Additionally include:

* Last Viewed Lesson
* Total Lessons Completed
* Course Progress Percentage
* Continue Learning Button
* Payment Status
* Course Access Status
* Invoice Availability Status
* Support Information

These fields should be API-ready for backend integration.

---

6. STUDENT DETAILS PAGE (ADMIN)

Additionally include:

* Student Name
* Email Address
* Mobile Number
* Join Date
* Last Login
* Course Progress Percentage
* Payment History
* Invoice Downloads
* Refund Status
* Course Access Status
* Email Delivery Logs
* Active / Locked Status

Admin Actions:

* Reset Password
* Resend Login Credentials
* Revoke Access
* Remove Access
* View Payment History
* View Invoice Details

---

7. REFUND FLOW REQUIREMENTS

Include frontend states for:

* Refund Requested
* Refund Pending
* Refund Successful
* Access Revoked
* Notification Sent Successfully

Refund Flow:

Refund Requested
↓
Refund Approved
↓
Access Revoked
↓
Student Notified
↓
Refund Completed

---

8. CONTENT MANAGEMENT UPLOAD FLOW

Video Upload Flow:

Uploading
↓
Processing Video
↓
Generating Streaming Assets
↓
Upload Successful
↓
Ready for Publishing
↓
Published

Include:

* Upload Progress Indicators
* Retry Upload
* Replace Existing File
* Delete File Confirmation
* Upload Failed State

PDF Upload Flow:

* Uploading
* Processing
* Successful
* Failed
* Retry Upload

---

9. PAYMENT PENDING STATES

Handle webhook delay scenarios appropriately.

Examples:

Payment Successful but:

* Course Access Not Yet Created
* Invoice Not Yet Generated
* Payment Verification Pending

Display:

"We're setting up your account. This may take a few minutes."

Include:

* Loading Indicators
* Automatic Refresh States
* Contact Support Option

IMPORTANT:
These states should not become dead ends in the user journey.

---

10. NOTIFICATION FLOW REQUIREMENTS

Admin Actions:

* Publish Course
* Publish Lesson
* Revoke Access
* Reset Password
* Refund Completed

Should support:

* Notification Sent State
* Notification Failed State
* Notification Pending State

Include reusable notification components wherever required.

---

11. SUPPORT COMPONENTS

Include reusable support components for:

* Payment Issues
* Login Issues
* Course Access Issues
* Upload Failures
* Invoice Related Problems

Support Components may include:

* Contact Support Button
* Support Information Cards
* Generic Help Messages

---

12. FRONTEND TO DATABASE COMPATIBILITY REQUIREMENTS

IMPORTANT:

All frontend components must be designed keeping future backend integration in mind.

The frontend should support the following entities:

* Users
* Students
* Payments
* Invoices
* Courses
* Sections
* Lessons
* Lesson Progress
* Course Progress
* Notifications
* Course Access
* Refund Status
* Device Sessions
* Email Logs

Examples of API-ready frontend fields:

Student Progress:

* total_lessons
* completed_lessons
* progress_percentage
* last_viewed_lesson
* resume_position

Payments:

* payment_id
* order_id
* invoice_id
* payment_status
* amount_paid

Course Access:

* access_status
* access_granted_at
* access_revoked_at

Invoices:

* invoice_number
* invoice_status
* invoice_download_url

Lessons:

* lesson_status
* lesson_type
* download_permission
* completion_status

IMPORTANT:
Do NOT hardcode frontend assumptions. Every major screen should be designed to consume API responses efficiently.

---

13. BACKEND FRIENDLY IMPLEMENTATION REQUIREMENTS

Every screen must support:

* Loading State
* Success State
* Empty State
* Error State
* Retry State

The frontend should be designed assuming:

* Data is fetched from APIs.
* Responses may fail.
* Responses may be delayed.
* Permissions may change dynamically.

---

14. FINAL CONSTRAINTS

DO NOT:

* Modify existing LMS requirements.
* Change the existing design system.
* Create duplicate components.
* Implement backend business logic.
* Implement database logic.

ALWAYS:

* Maintain complete UI consistency.
* Follow existing colors, typography and spacing.
* Build reusable components.
* Keep all components API-ready.
* Prioritize maintainability and scalability.

IMPORTANT:

The final frontend should be production-ready, fully responsive, API-ready, Razorpay-compatible and optimized for seamless integration with the backend architecture while maintaining the existing LMS design language inspired by Coursera, Linear and Notion.