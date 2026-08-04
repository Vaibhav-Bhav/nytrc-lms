import { useState, useEffect } from "react";
import { Toaster } from "sonner";
import { Screen } from "../data/types";
import { DarkCtx } from "./components/DarkContext";
import { ScreenSwitcher } from "./components/ScreenSwitcher";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Auth Screens
import { LoginScreen } from "./screens/auth/LoginScreen";
import { ForcePasswordScreen } from "./screens/auth/ForcePasswordScreen";
import { ForgotPasswordScreen } from "./screens/auth/ForgotPasswordScreen";
import { AccountLockedScreen } from "./screens/auth/AccountLockedScreen";
import { SessionExpiredScreen } from "./screens/auth/SessionExpiredScreen";
import { DeviceSessionScreen } from "./screens/auth/DeviceSessionScreen";
import { DeviceLimitExceededScreen } from "./screens/auth/DeviceLimitExceededScreen";
import { PasswordChangedScreen } from "./screens/auth/PasswordChangedScreen";

// Checkout & Payment Screens (Preserved out-of-scope code)
import { CheckoutScreen } from "./screens/checkout/CheckoutScreen";
import { PaymentProcessingScreen } from "./screens/checkout/PaymentProcessingScreen";
import { PaymentSuccessScreen } from "./screens/checkout/PaymentSuccessScreen";
import { PaymentFailedScreen } from "./screens/checkout/PaymentFailedScreen";
import { PaymentPendingScreen } from "./screens/checkout/PaymentPendingScreen";

// Student Screens
import { StudentDashboard } from "./screens/student/StudentDashboard";
import { StudentCourses } from "./screens/student/StudentCourses";
import { StudentCourseDetail } from "./screens/student/StudentCourseDetail";
import { CoursePlayer } from "./screens/student/CoursePlayer";
import { StudentAccount } from "./screens/student/StudentAccount";

// Admin Screens
import { AdminDashboard } from "./screens/admin/AdminDashboard";
import { AdminCreateCourse } from "./screens/admin/AdminCreateCourse";
import { AdminContent } from "./screens/admin/AdminContent";
import { AdminStudents } from "./screens/admin/AdminStudents";
import { AdminStudentDetail } from "./screens/admin/AdminStudentDetail";
import { AdminRefundFlow } from "./screens/admin/AdminRefundFlow";

// State / Skeleton Screens
import { SkeletonDashboard, SkeletonPlayer, SkeletonAdminTable } from "./screens/states/SkeletonScreens";
import { EmptyStudentDashboard } from "./screens/states/EmptyStudentDashboard";
import { EmptyAdminStudents } from "./screens/states/EmptyAdminStudents";
import { EmptyAdminContent } from "./screens/states/EmptyAdminContent";
import { ErrorContentScreen } from "./screens/states/ErrorContentScreen";

export default function App() {
  const [screen, setScreen] = useState<Screen>("student-dashboard");
  const [selectedStudentId, setSelectedStudentId] = useState("s1");
  const [selectedCourseId, setSelectedCourseId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("lms_selected_course_id") || "c1";
    }
    return "c1";
  });
  const [dark, setDark] = useState(false);

  const handleSelectCourse = (id: string) => {
    setSelectedCourseId(id);
    if (typeof window !== "undefined") {
      localStorage.setItem("lms_selected_course_id", id);
    }
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <DarkCtx.Provider value={{ dark, toggle: () => setDark((d) => !d) }}>
      <div className="min-h-screen bg-background" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <ErrorBoundary key={screen} onReset={() => setScreen("admin-students")}>
          {screen === "login"                  && <LoginScreen onNavigate={setScreen} />}
          {screen === "force-password"         && <ForcePasswordScreen onNavigate={setScreen} />}
          {screen === "forgot-password"        && <ForgotPasswordScreen onNavigate={setScreen} />}
          {screen === "auth-locked"            && <AccountLockedScreen onNavigate={setScreen} />}
          {screen === "auth-session-expired"   && <SessionExpiredScreen onNavigate={setScreen} />}
          {screen === "auth-device-session"    && <DeviceSessionScreen onNavigate={setScreen} />}
          {screen === "auth-device-limit-exceeded" && <DeviceLimitExceededScreen onNavigate={setScreen} />}
          {screen === "auth-password-changed"  && <PasswordChangedScreen onNavigate={setScreen} />}
          {screen === "checkout"               && <CheckoutScreen onNavigate={setScreen} />}
          {screen === "payment-processing"     && <PaymentProcessingScreen />}
          {screen === "payment-success"        && <PaymentSuccessScreen onNavigate={setScreen} />}
          {screen === "payment-failed"         && <PaymentFailedScreen onNavigate={setScreen} />}
          {screen === "payment-pending"        && <PaymentPendingScreen onNavigate={setScreen} />}
          {screen === "student-dashboard"      && <StudentDashboard onNavigate={setScreen} onSelectCourse={handleSelectCourse} />}
          {screen === "student-courses"        && <StudentCourses onNavigate={setScreen} onSelectCourse={handleSelectCourse} />}
          {screen === "student-course-detail"  && <StudentCourseDetail onNavigate={setScreen} selectedCourseId={selectedCourseId} />}
          {screen === "course-player"          && <CoursePlayer onNavigate={setScreen} selectedCourseId={selectedCourseId} />}
          {screen === "student-account"        && <StudentAccount onNavigate={setScreen} />}
          {screen === "admin-dashboard"        && <AdminDashboard onNavigate={setScreen} />}
          {screen === "admin-create-course"    && <AdminCreateCourse onNavigate={setScreen} onSelectCourse={handleSelectCourse} />}
          {screen === "admin-content"          && <AdminContent onNavigate={setScreen} selectedCourseId={selectedCourseId} onSelectCourse={handleSelectCourse} />}
          {screen === "admin-students"         && <AdminStudents onNavigate={setScreen} onSelectStudent={(id) => setSelectedStudentId(id)} />}
          {screen === "admin-student-detail"   && <AdminStudentDetail onNavigate={setScreen} studentId={selectedStudentId} />}
          {screen === "admin-refund"           && <AdminRefundFlow onNavigate={setScreen} />}
          {screen === "skel-dashboard"         && <SkeletonDashboard onNavigate={setScreen} />}
          {screen === "skel-player"            && <SkeletonPlayer onNavigate={setScreen} />}
          {screen === "skel-admin-table"       && <SkeletonAdminTable onNavigate={setScreen} />}
          {screen === "empty-student"          && <EmptyStudentDashboard onNavigate={setScreen} />}
          {screen === "empty-admin-students"   && <EmptyAdminStudents onNavigate={setScreen} />}
          {screen === "empty-admin-content"    && <EmptyAdminContent onNavigate={setScreen} />}
          {screen === "error-content"          && <ErrorContentScreen onNavigate={setScreen} />}
        </ErrorBoundary>

        <ScreenSwitcher current={screen} onNavigate={setScreen} />
        <Toaster theme={dark ? "dark" : "light"} position="bottom-right" richColors closeButton />
      </div>
    </DarkCtx.Provider>
  );
}
