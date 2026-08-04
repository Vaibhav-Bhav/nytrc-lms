import { useState, useEffect } from "react";
import {
  ArrowLeft, Mail, Phone, Clock, ChevronRight, Send, RefreshCw, UserX, Trash2,
  AlertTriangle, Monitor, Smartphone, Tablet, Lock, ShieldCheck, CheckCircle2,
  AlertCircle, ShieldAlert
} from "lucide-react";
import { toast } from "sonner";
import { Screen, Student, DeviceSession, PaymentInvoice } from "../../../data/types";
import { INITIAL_STUDENTS, PAYMENT_HISTORY, EMAIL_LOG } from "../../../data/mockData";
import { lmsService } from "../../../services/lmsService";
import { sessionService } from "../../../services/sessionService";
import { AdminLayout } from "../../components/AdminLayout";
import { Breadcrumb } from "../../components/Breadcrumb";
import { Badge } from "../../components/Badge";
import { ProgressBar } from "../../components/ProgressBar";
import { InvoiceCard } from "../../components/InvoiceCard";
import { Button, cn } from "../../components/Button";
import { ConfirmModal, ConfirmDialog } from "../../components/ConfirmDialog";
import { NotificationStatus, NotifState } from "../../components/NotificationStatus";

export function AdminStudentDetail({
  onNavigate,
  studentId,
}: {
  onNavigate: (s: Screen) => void;
  studentId: string;
}) {
  const [student, setStudent] = useState<Student | null>(null);
  const [invoices, setInvoices] = useState<PaymentInvoice[]>(PAYMENT_HISTORY);
  const [sessions, setSessions] = useState<DeviceSession[]>([]);
  const [maxDevices, setMaxDevices] = useState(2);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "sessions">("overview");

  // Modals state
  const [revokeModal, setRevokeModal] = useState(false);
  const [resetModal, setResetModal] = useState(false);
  const [resendModal, setResendModal] = useState(false);
  const [lockModal, setLockModal] = useState(false);
  const [deleteStudentModal, setDeleteStudentModal] = useState(false);
  const [selectedDeviceToLogout, setSelectedDeviceToLogout] = useState<DeviceSession | null>(null);
  const [logoutDeviceModal, setLogoutDeviceModal] = useState(false);
  const [logoutAllModal, setLogoutAllModal] = useState(false);

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [notifState, setNotifState] = useState<{ action: string; status: NotifState } | null>(null);
  const [accessRevoked, setAccessRevoked] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const detailRes = await lmsService.getStudentById(studentId);
      if (detailRes && detailRes.student) {
        setStudent(detailRes.student);
      } else {
        // Fallback search
        const allStudents = await lmsService.getStudents();
        const found = allStudents.find((s) => s.id === studentId) || allStudents[0];
        setStudent(found || null);
      }

      // Fetch student sessions
      const sessionRes = await lmsService.getStudentSessions(studentId);
      setSessions(sessionRes.devices);
      setMaxDevices(sessionRes.max_devices);

      // Fetch payments
      const paymentRes = await lmsService.getStudentPayments(studentId);
      setInvoices(paymentRes.invoices);
    } catch (err: any) {
      console.error("Error loading student detail:", err);
      setError("Failed to load student details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [studentId]);

  const activeStudent = student || INITIAL_STUDENTS[0];
  const safeName = activeStudent?.name || "Student";
  const initials = safeName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const totalLessons = activeStudent?.totalLessons || 15;
  const completedLessons = activeStudent?.completedLessons ?? Math.round(((activeStudent?.progress || 0) / 100) * totalLessons);
  const remainingLessons = Math.max(0, totalLessons - completedLessons);

  function runAction(key: string, close: () => void, msg: string, onSuccess?: () => void) {
    setActionLoading(key);
    setTimeout(() => {
      setActionLoading(null);
      close();
      toast.success(msg);
      onSuccess?.();
      setNotifState({ action: key, status: "sent" });
      setTimeout(() => setNotifState(null), 3000);
    }, 1000);
  }

  async function handleConfirmLockStudent() {
    if (!activeStudent) return;
    setActionLoading("lock");
    try {
      const updated = await lmsService.lockStudent(activeStudent.id);
      setStudent(updated);
      toast.success(updated.status === "locked" ? "Student account locked" : "Student account unlocked");
      setLockModal(false);
    } catch (err) {
      toast.error("Failed to update student lock status");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleConfirmDeleteStudent() {
    if (!activeStudent) return;
    setActionLoading("delete");
    try {
      await lmsService.deleteStudent(activeStudent.id);
      toast.success("Student permanently deleted");
      setDeleteStudentModal(false);
      onNavigate("admin-students");
    } catch (err) {
      toast.error("Failed to delete student");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRevokeDeviceSession() {
    if (!selectedDeviceToLogout) return;
    setActionLoading("revoke-device");
    try {
      const updated = await sessionService.revokeSession(selectedDeviceToLogout.id);
      setSessions(updated.devices);
      toast.success(`Logged out session: ${selectedDeviceToLogout.device_name}`);
      setLogoutDeviceModal(false);
      setSelectedDeviceToLogout(null);
    } catch (err) {
      toast.error("Failed to revoke session");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleLogoutAllDevices() {
    setActionLoading("logout-all");
    try {
      const updated = await sessionService.logoutAllSessions();
      setSessions(updated.devices);
      toast.success("All device sessions logged out");
      setLogoutAllModal(false);
    } catch (err) {
      toast.error("Failed to logout all sessions");
    } finally {
      setActionLoading(null);
    }
  }

  function renderDeviceIcon(type?: string) {
    if (type === "mobile") return <Smartphone className="w-5 h-5 text-primary" />;
    if (type === "tablet") return <Tablet className="w-5 h-5 text-primary" />;
    return <Monitor className="w-5 h-5 text-primary" />;
  }

  const PROFILE_FIELDS = [
    { label: "Email", value: activeStudent?.email || "—", icon: Mail },
    { label: "Mobile", value: activeStudent?.mobile || "—", icon: Phone },
    { label: "Joined", value: activeStudent?.joined || "—", icon: Clock },
    { label: "Last login", value: activeStudent?.lastLogin || "—", icon: Clock },
  ];

  if (loading) {
    return (
      <AdminLayout current="admin-student-detail" onNavigate={onNavigate}>
        <main className="flex-1 p-4 sm:p-8">
          <div className="mb-4 sm:mb-5">
            <Breadcrumb items={[{ label: "Admin" }, { label: "Students" }, { label: "Loading..." }]} />
          </div>
          <div className="max-w-2xl bg-card rounded-xl border border-border p-8 text-center">
            <RefreshCw className="w-6 h-6 animate-spin text-primary mx-auto mb-3" />
            <p className="text-sm text-muted-foreground font-medium">Loading student profile & sessions...</p>
          </div>
        </main>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout current="admin-student-detail" onNavigate={onNavigate}>
        <main className="flex-1 p-4 sm:p-8">
          <div className="mb-4 sm:mb-5">
            <Breadcrumb items={[{ label: "Admin" }, { label: "Students", onClick: () => onNavigate("admin-students") }, { label: "Error" }]} />
          </div>
          <div className="max-w-2xl bg-card rounded-xl border border-border p-8 text-center">
            <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
            <h2 className="text-lg font-bold text-foreground mb-1">Failed to load student detail</h2>
            <p className="text-xs text-muted-foreground mb-4">{error}</p>
            <div className="flex justify-center gap-3">
              <Button variant="secondary" size="sm" onClick={() => onNavigate("admin-students")}>
                <ArrowLeft className="w-4 h-4" />
                Back to Students
              </Button>
              <Button size="sm" onClick={loadData}>
                <RefreshCw className="w-4 h-4" />
                Retry
              </Button>
            </div>
          </div>
        </main>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout current="admin-student-detail" onNavigate={onNavigate}>
      <main className="flex-1 p-4 sm:p-8">
        <div className="mb-4 sm:mb-5">
          <Breadcrumb
            items={[
              { label: "Admin" },
              { label: "Students", onClick: () => onNavigate("admin-students") },
              { label: safeName },
            ]}
          />
        </div>

        {/* Top Header */}
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <button onClick={() => onNavigate("admin-students")} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground">{safeName}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{activeStudent.email}</p>
          </div>
          <Badge variant={accessRevoked ? "access-revoked" : activeStudent.status} />
        </div>

        {/* Main Tabs Header */}
        <div className="max-w-2xl border-b border-border mb-6 flex gap-6">
          <button
            onClick={() => setActiveTab("overview")}
            className={cn(
              "pb-3 text-sm font-semibold border-b-2 transition-colors -mb-px flex items-center gap-2",
              activeTab === "overview"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Overview & Details
          </button>
          <button
            onClick={() => setActiveTab("sessions")}
            className={cn(
              "pb-3 text-sm font-semibold border-b-2 transition-colors -mb-px flex items-center gap-2",
              activeTab === "sessions"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Monitor className="w-4 h-4" />
            Sessions ({sessions.filter((s) => s.status === "active").length}/{maxDevices})
          </button>
        </div>

        <div className="max-w-2xl flex flex-col gap-4">
          {activeTab === "overview" ? (
            <>
              {/* Profile Card */}
              <div className="bg-card rounded-xl border border-border shadow-sm">
                <div className="px-5 sm:px-6 py-4 border-b border-border flex items-center justify-between">
                  <h2 className="font-semibold text-foreground">Profile</h2>
                  <span className="text-xs text-muted-foreground">ID: {activeStudent.id}</span>
                </div>
                <div className="px-5 sm:px-6 py-5">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-base font-semibold text-primary">{initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground">{safeName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant={accessRevoked ? "access-revoked" : activeStudent.status} />
                        <span className="text-xs text-muted-foreground">{activeStudent.progress}% complete</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PROFILE_FIELDS.map(({ label, value, icon: Icon }) => (
                      <div key={label} className="flex items-start gap-2.5">
                        <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">{label}</p>
                          <p className="text-sm font-medium text-foreground truncate">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Enrollment Info Card */}
              <div className="bg-card rounded-xl border border-border shadow-sm">
                <div className="px-5 sm:px-6 py-4 border-b border-border">
                  <h2 className="font-semibold text-foreground">Enrollment Details</h2>
                </div>
                <div className="px-5 sm:px-6 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-muted-foreground">Enrolled Course</p>
                    <p className="text-sm font-semibold text-foreground mt-0.5">
                      {activeStudent.courseName || "Modern JavaScript: From Fundamentals to Advanced"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Enrollment Date</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">
                      {activeStudent.enrollmentDate || activeStudent.joined}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Access Start / End Date</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">
                      {activeStudent.accessStartDate || activeStudent.joined} — {activeStudent.accessEndDate || "2025-11-03"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Login Timestamp</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">{activeStudent.lastLogin}</p>
                  </div>
                </div>
              </div>

              {/* Course Progress Card */}
              <div className="bg-card rounded-xl border border-border shadow-sm p-5 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-foreground">Course Progress</h2>
                  <span className="text-lg font-semibold text-foreground">{activeStudent.progress}%</span>
                </div>
                <ProgressBar value={activeStudent.progress} color={activeStudent.progress >= 75 ? "green" : "primary"} />
                <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                  <span>Completed lessons: <strong className="text-foreground">{completedLessons}</strong> of {totalLessons}</span>
                  <span>Remaining: <strong className="text-foreground">{remainingLessons}</strong> lessons</span>
                </div>
              </div>

              {/* Course Access Status */}
              <div className="bg-card rounded-xl border border-border shadow-sm">
                <div className="px-5 sm:px-6 py-4 border-b border-border">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-foreground">Course Access State</h2>
                    <Badge variant={accessRevoked ? "access-revoked" : activeStudent.status === "locked" ? "access-locked" : "access-granted"} />
                  </div>
                </div>
                <div className="px-5 sm:px-6 py-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-muted-foreground">Access Status</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">
                      {accessRevoked ? "Revoked" : activeStudent.status === "locked" ? "Locked" : "Active / Granted"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Revocation Record</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">
                      {accessRevoked ? "2024-12-20 11:00" : <span className="text-muted-foreground">—</span>}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment History */}
              <div className="bg-card rounded-xl border border-border shadow-sm">
                <div className="px-5 sm:px-6 py-4 border-b border-border flex items-center justify-between">
                  <h2 className="font-semibold text-foreground">Payment Info</h2>
                  <Badge variant="paid" />
                </div>
                {invoices.map((inv) => (
                  <InvoiceCard key={inv.id} inv={inv} onDownload={() => toast.success("Invoice downloaded")} />
                ))}
              </div>

              {/* Email Delivery Log */}
              <div className="bg-card rounded-xl border border-border shadow-sm">
                <div className="px-5 sm:px-6 py-4 border-b border-border">
                  <h2 className="font-semibold text-foreground">Email Delivery Log</h2>
                </div>
                {EMAIL_LOG.map((entry, i) => (
                  <div
                    key={entry.id}
                    className={cn("flex items-center justify-between px-5 sm:px-6 py-3 gap-3", i > 0 && "border-t border-border")}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{entry.type}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{entry.sent}</p>
                    </div>
                    <Badge variant={entry.status} />
                  </div>
                ))}
              </div>

              {/* Admin Actions */}
              <div className="bg-card rounded-xl border border-border shadow-sm">
                <div className="px-5 sm:px-6 py-4 border-b border-border">
                  <h2 className="font-semibold text-foreground">Admin Actions</h2>
                </div>
                <div className="p-5 sm:p-6">
                  <div className="flex flex-wrap gap-3">
                    <Button variant="secondary" size="sm" onClick={() => setResendModal(true)}>
                      <Send className="w-4 h-4" />
                      Resend login email
                    </Button>

                    <Button variant="secondary" size="sm" onClick={() => setResetModal(true)}>
                      <RefreshCw className="w-4 h-4" />
                      Reset password
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setLockModal(true)}
                      className={cn(activeStudent.status === "locked" && "text-emerald-600 border-emerald-200")}
                    >
                      <Lock className="w-4 h-4" />
                      {activeStudent.status === "locked" ? "Unlock student" : "Lock student"}
                    </Button>

                    <Button variant="destructive" size="sm" onClick={() => setRevokeModal(true)}>
                      <UserX className="w-4 h-4" />
                      Revoke access
                    </Button>

                    <Button variant="destructive" size="sm" onClick={() => setDeleteStudentModal(true)}>
                      <Trash2 className="w-4 h-4" />
                      Delete student
                    </Button>
                  </div>

                  {notifState && (
                    <div className="mt-4">
                      <NotificationStatus
                        state={notifState.status}
                        label={
                          notifState.action === "resend"
                            ? "Login email sent to student"
                            : notifState.action === "reset-pw"
                            ? "Password reset email sent"
                            : notifState.action === "revoke"
                            ? "Access revoked · Student notified"
                            : "Action completed"
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* Sessions Tab View */
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
              <div className="px-5 sm:px-6 py-4 border-b border-border flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h2 className="font-semibold text-foreground flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-primary" />
                    Active Device Sessions
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Managing signed-in device sessions for {safeName}. Maximum 2 active devices allowed.
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-primary/10 text-primary rounded-lg border border-primary/20">
                  Active Devices: {sessions.filter((s) => s.status === "active").length} / {maxDevices}
                </span>
              </div>

              {/* Server-side disclaimer note */}
              <div className="px-5 sm:px-6 py-3 bg-amber-500/10 border-b border-amber-500/20 flex items-start gap-2.5 text-xs text-amber-700 dark:text-amber-300">
                <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Backend Enforcement Notice:</strong> Client-side mock limits are for presentation & workflow demonstration. Production device limits must be strictly verified server-side against the sessions table on every request.
                </p>
              </div>

              <div className="p-5 sm:p-6 flex flex-col gap-4">
                {sessions.length === 0 ? (
                  <p className="text-center py-6 text-xs text-muted-foreground">No active device sessions recorded.</p>
                ) : (
                  sessions.map((device, idx) => (
                    <div
                      key={device.id}
                      className="p-4 rounded-xl border border-border bg-card/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          {renderDeviceIcon(device.type)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-sm font-bold text-foreground">
                              {idx + 1}. {device.device_name}
                            </span>
                            {device.is_current_device && (
                              <span className="text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-md font-semibold border border-primary/20">
                                Current Device
                              </span>
                            )}
                            <span
                              className={cn(
                                "text-[10px] px-1.5 py-0.5 rounded font-medium uppercase",
                                device.status === "active"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                  : "bg-muted text-muted-foreground"
                              )}
                            >
                              {device.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                            <p><span className="font-medium text-foreground">Browser:</span> {device.browser}</p>
                            <p><span className="font-medium text-foreground">OS:</span> {device.os}</p>
                            <p><span className="font-medium text-foreground">Login Time:</span> {device.login_time}</p>
                            <p><span className="font-medium text-foreground">Last Active:</span> {device.last_active || device.lastActive}</p>
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setSelectedDeviceToLogout(device);
                          setLogoutDeviceModal(true);
                        }}
                        className="text-xs self-end sm:self-center"
                      >
                        Logout device
                      </Button>
                    </div>
                  ))
                )}

                {sessions.length > 0 && (
                  <div className="pt-3 border-t border-border flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLogoutAllModal(true)}
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive text-xs"
                    >
                      Logout All Devices
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Confirmation Modals */}
      <ConfirmModal
        open={resendModal}
        onClose={() => setResendModal(false)}
        onConfirm={() => runAction("resend", () => setResendModal(false), "Login details sent to " + activeStudent.email)}
        loading={actionLoading === "resend"}
        title="Resend login details"
        description={`A new email with login instructions will be sent to ${activeStudent.email}. This will not change their password.`}
        confirmLabel="Send email"
        confirmVariant="primary"
        icon={Send}
      />

      <ConfirmModal
        open={resetModal}
        onClose={() => setResetModal(false)}
        onConfirm={() => runAction("reset-pw", () => setResetModal(false), "Password reset link sent")}
        loading={actionLoading === "reset-pw"}
        title="Reset password"
        description={`A password reset link will be sent to ${activeStudent.email}. The link expires after 24 hours.`}
        confirmLabel="Send reset link"
        confirmVariant="primary"
        icon={RefreshCw}
      />

      <ConfirmModal
        open={lockModal}
        onClose={() => setLockModal(false)}
        onConfirm={handleConfirmLockStudent}
        loading={actionLoading === "lock"}
        title={activeStudent.status === "locked" ? "Unlock student account" : "Lock student account"}
        description={
          activeStudent.status === "locked"
            ? `Are you sure you want to unlock ${safeName}'s account? They will regain access to sign in.`
            : `Are you sure you want to lock ${safeName}'s account? They will be unable to log in until unlocked.`
        }
        confirmLabel={activeStudent.status === "locked" ? "Unlock account" : "Lock account"}
        confirmVariant={activeStudent.status === "locked" ? "primary" : "destructive"}
        icon={Lock}
      />

      <ConfirmModal
        open={revokeModal}
        onClose={() => setRevokeModal(false)}
        onConfirm={() => runAction("revoke", () => setRevokeModal(false), "Access revoked", () => setAccessRevoked(true))}
        loading={actionLoading === "revoke"}
        title="Revoke access"
        description={`${safeName} will lose access to all course content immediately. Their progress is preserved and access can be reinstated at any time.`}
        warning="This action does not trigger a refund. If a refund is needed, process it separately in the payment provider dashboard before revoking."
        confirmLabel="Revoke access"
        confirmVariant="destructive"
        icon={AlertTriangle}
      />

      <ConfirmModal
        open={deleteStudentModal}
        onClose={() => setDeleteStudentModal(false)}
        onConfirm={handleConfirmDeleteStudent}
        loading={actionLoading === "delete"}
        title="Delete student permanently"
        description={`This will permanently delete ${safeName}'s student record and all enrollment history.`}
        warning="All course progress data, active sessions, and records will be deleted. This action cannot be undone."
        confirmLabel="Delete student"
        confirmVariant="destructive"
        icon={Trash2}
      />

      <ConfirmDialog
        isOpen={logoutDeviceModal}
        onClose={() => setLogoutDeviceModal(false)}
        onConfirm={handleRevokeDeviceSession}
        title="Revoke Device Session?"
        description={`Are you sure you want to log out session for "${selectedDeviceToLogout?.device_name}"?`}
        confirmText="Confirm Logout"
        loading={actionLoading === "revoke-device"}
        variant="destructive"
      />

      <ConfirmDialog
        isOpen={logoutAllModal}
        onClose={() => setLogoutAllModal(false)}
        onConfirm={handleLogoutAllDevices}
        title="Logout All Devices?"
        description={`Are you sure you want to force log out all active device sessions for ${safeName}?`}
        confirmText="Logout All Devices"
        loading={actionLoading === "logout-all"}
        variant="destructive"
      />
    </AdminLayout>
  );
}
