import { useState, useEffect } from "react";
import { ArrowLeft, Mail, Phone, Clock, ChevronRight, Send, RefreshCw, UserX, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Screen, Student } from "../../../data/types";
import { AdminLayout } from "../../components/AdminLayout";
import { Breadcrumb } from "../../components/Breadcrumb";
import { Badge } from "../../components/Badge";
import { ProgressBar } from "../../components/ProgressBar";
import { InvoiceCard } from "../../components/InvoiceCard";
import { Button, cn } from "../../components/Button";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { NotificationStatus, NotifState } from "../../components/NotificationStatus";

export function AdminStudentDetail({
  onNavigate,
  studentId,
}: {
  onNavigate?: (s: Screen) => void;
  studentId: string;
}) {
  const [student, setStudent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [revokeModal, setRevokeModal] = useState(false);
  const [resetModal, setResetModal] = useState(false);
  const [resendModal, setResendModal] = useState(false);
  const [removeModal, setRemoveModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [notifState, setNotifState] = useState<{ action: string; status: NotifState } | null>(null);
  const [accessRevoked, setAccessRevoked] = useState(false);

  useEffect(() => {
    async function loadStudent() {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/students/${studentId}`);
        if (!response.ok) throw new Error("Failed to load student details");
        const data = await response.json();
        setStudent(data);
        if (data.access?.status === "revoked") {
          setAccessRevoked(true);
        }
      } catch (e) {
        console.error(e);
        toast.error("Failed to load student data");
      } finally {
        setLoading(false);
      }
    }
    loadStudent();
  }, [studentId]);

  if (loading) {
    return (
      <AdminLayout>
        <main className="flex-1 overflow-y-auto bg-background flex items-center justify-center min-h-[50vh]">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground text-sm">Loading student details...</p>
          </div>
        </main>
      </AdminLayout>
    );
  }

  if (!student) {
    return (
      <AdminLayout>
        <main className="flex-1 overflow-y-auto bg-background flex items-center justify-center min-h-[50vh]">
          <div className="flex flex-col items-center gap-3">
            <UserX className="w-10 h-10 text-muted-foreground/30" />
            <p className="text-muted-foreground text-sm font-medium">Student not found</p>
            <Button variant="secondary" onClick={() => onNavigate?.("admin-students")}>
              Back to Students
            </Button>
          </div>
        </main>
      </AdminLayout>
    );
  }

  const activeStudent = student;

  function runAction(key: string, close: () => void, msg: string, onSuccess?: () => void) {
    setActionLoading(key);
    setTimeout(() => {
      setActionLoading(null);
      close();
      toast.success(msg);
      onSuccess?.();
      setNotifState({ action: key, status: "sent" });
      setTimeout(() => setNotifState(null), 3000);
    }, 1200);
  }

  async function handleRevokeAccess() {
    setActionLoading("revoke");
    try {
      const action = accessRevoked ? "restore" : "revoke";
      const res = await fetch(`/api/admin/students/${studentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error("Failed to update access");
      setAccessRevoked(!accessRevoked);
      setRevokeModal(false);
      toast.success(accessRevoked ? "Access reinstated successfully" : "Access temporarily revoked");
      setNotifState({ action: "revoke", status: "sent" });
      setTimeout(() => setNotifState(null), 3000);
    } catch (e) {
      toast.error("Failed to update student access");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRemoveAccess() {
    setActionLoading("remove");
    try {
      const res = await fetch(`/api/admin/students/${studentId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove student");
      setRemoveModal(false);
      toast.success("Student data and access permanently deleted from backend");
      if (onNavigate) {
        onNavigate("admin-students");
      } else {
        window.location.href = "/admin/students";
      }
    } catch (e) {
      toast.error("Failed to remove student");
    } finally {
      setActionLoading(null);
    }
  }

  const PROFILE_FIELDS = [
    { label: "Email", value: activeStudent.email, icon: Mail },
    { label: "Mobile", value: activeStudent.mobile, icon: Phone },
    { label: "Joined", value: activeStudent.joined, icon: Clock },
    { label: "Last login", value: activeStudent.lastLogin, icon: Clock },
  ];

  return (
    <AdminLayout>
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="max-w-[800px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
          <div className="mb-4">
            <Breadcrumb
              items={[
                { label: "Admin" },
                { label: "Students", onClick: () => onNavigate?.("admin-students") },
                { label: activeStudent.name },
              ]}
            />
          </div>

          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <button
              onClick={() => onNavigate?.("admin-students")}
              className="p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">{activeStudent.name}</h1>
            </div>
            <Badge variant={activeStudent.status} />
          </div>

          <div className="max-w-2xl flex flex-col gap-6">
            {/* Profile card */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="px-5 sm:px-6 py-4 border-b border-border bg-muted/20">
                <h2 className="font-bold text-foreground text-base">Profile Overview</h2>
              </div>
              <div className="px-5 sm:px-6 py-5">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-base font-extrabold text-primary">
                      {activeStudent.name.split(" ").map((n: string) => n[0]).join("")}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground text-base">{activeStudent.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant={activeStudent.status} />
                      <span className="text-xs text-muted-foreground font-semibold">{activeStudent.progress}% complete</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {PROFILE_FIELDS.map(({ label, value, icon: Icon }) => (
                    <div key={label} className="flex items-start gap-2.5">
                      <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground font-medium">{label}</p>
                        <p className="text-sm font-semibold text-foreground truncate">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Course Progress card */}
            <div className="bg-card rounded-2xl border border-border shadow-sm p-5 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-foreground text-base">Course Progress</h2>
                <span className="text-lg font-extrabold text-foreground">{activeStudent.progress}%</span>
              </div>
              <ProgressBar value={activeStudent.progress} color={activeStudent.progress >= 75 ? "green" : "primary"} />
              <p className="text-xs text-muted-foreground font-medium mt-2">
                Approx. {Math.round((activeStudent.progress / 100) * 15)} of 15 lessons completed
              </p>
            </div>

            {/* Course Access status */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="px-5 sm:px-6 py-4 border-b border-border bg-muted/20">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-foreground text-base">Course Access</h2>
                  <Badge variant={accessRevoked ? "access-revoked" : "access-granted"} />
                </div>
              </div>
              <div className="px-5 sm:px-6 py-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Access granted</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">2024-11-03 09:14</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Access revoked</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {accessRevoked ? new Date().toISOString().split('T')[0] : <span className="text-muted-foreground">—</span>}
                  </p>
                </div>
              </div>
            </div>

            {/* Refund Status */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="px-5 sm:px-6 py-4 border-b border-border bg-muted/20">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-foreground text-base">Refund Status</h2>
                  <Badge variant="refund-requested" />
                </div>
              </div>
              <div className="px-5 sm:px-6 py-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Requested on</p>
                  <p className="text-sm font-bold text-foreground">2024-12-20</p>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">Amount: ₹14,750 · Order: ORD-2024-001</p>
                </div>
                <Button variant="secondary" size="sm" onClick={() => onNavigate?.("admin-refund")}>
                  View flow <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Payment history */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="px-5 sm:px-6 py-4 border-b border-border bg-muted/20">
                <h2 className="font-bold text-foreground text-base">Payment History</h2>
              </div>
              {(activeStudent.invoices || []).map((inv: any) => (
                <InvoiceCard key={inv.id} inv={inv} onDownload={() => toast.success("Invoice downloaded")} />
              ))}
              {(!activeStudent.invoices || activeStudent.invoices.length === 0) && (
                <div className="px-5 sm:px-6 py-4 text-sm text-muted-foreground">No invoices found.</div>
              )}
            </div>

            {/* Recent Sessions */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="px-5 sm:px-6 py-4 border-b border-border bg-muted/20">
                <h2 className="font-bold text-foreground text-base">Recent Sessions</h2>
              </div>
              {(activeStudent.sessions || []).map((session: any, i: number) => (
                <div
                  key={session.id}
                  className={cn("flex items-center justify-between px-5 sm:px-6 py-3.5 gap-3", i > 0 && "border-t border-border")}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{session.browser || "Unknown Browser"} on {session.os || "Unknown OS"}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{new Date(session.created_at).toLocaleString()} · IP: {session.ip_address}</p>
                  </div>
                  <Badge variant={session.is_active ? "active" : "cancelled"} />
                </div>
              ))}
              {(!activeStudent.sessions || activeStudent.sessions.length === 0) && (
                <div className="px-5 sm:px-6 py-4 text-sm text-muted-foreground">No recent sessions.</div>
              )}
            </div>

            {/* Email Delivery Log */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden mb-6">
              <div className="px-5 sm:px-6 py-4 border-b border-border bg-muted/20 flex items-center justify-between">
                <h2 className="font-bold text-foreground text-base">Email Delivery Log</h2>
                <span className="text-xs text-muted-foreground">Transactional Logs</span>
              </div>
              <div className="p-5 sm:p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/10 text-muted-foreground uppercase font-bold">
                        <th className="py-2.5 px-3">Template</th>
                        <th className="py-2.5 px-3">Recipient</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Sent At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {[
                        { template: "payment_confirmation", to: activeStudent.email, status: "delivered", date: activeStudent.joined },
                        { template: "account_created", to: activeStudent.email, status: "delivered", date: activeStudent.joined },
                      ].map((item, idx) => (
                        <tr key={idx} className="hover:bg-muted/10">
                          <td className="py-2.5 px-3 font-mono font-semibold text-foreground">{item.template}</td>
                          <td className="py-2.5 px-3 text-muted-foreground">{item.to}</td>
                          <td className="py-2.5 px-3">
                            <Badge variant="delivered" />
                          </td>
                          <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">{item.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="px-5 sm:px-6 py-4 border-b border-border bg-muted/20">
                <h2 className="font-bold text-foreground text-base">Student Actions</h2>
              </div>
              <div className="p-5 sm:p-6">
                <div className="flex flex-wrap gap-3">
                  <Button variant="secondary" size="sm" onClick={() => setResendModal(true)}>
                    <Send className="w-4 h-4" />
                    Resend login details
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setResetModal(true)}>
                    <RefreshCw className="w-4 h-4" />
                    Reset password
                  </Button>
                  <Button variant={accessRevoked ? "primary" : "destructive"} size="sm" onClick={() => setRevokeModal(true)}>
                    <UserX className="w-4 h-4" />
                    {accessRevoked ? "Reinstate access" : "Revoke access"}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setRemoveModal(true)}>
                    <Trash2 className="w-4 h-4" />
                    Remove access
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
                          ? (accessRevoked ? "Access revoked · Student notified" : "Access reinstated")
                          : "Action completed"
                      }
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <ConfirmDialog
        isOpen={resendModal}
        onClose={() => setResendModal(false)}
        onConfirm={() => runAction("resend", () => setResendModal(false), "Login details sent")}
        loading={actionLoading === "resend"}
        title="Resend login details?"
        description={`A new email with login instructions will be sent to ${activeStudent.email}. This will not change their password.`}
        confirmText="Send email"
        variant="primary"
        icon={Send}
      />

      <ConfirmDialog
        isOpen={resetModal}
        onClose={() => setResetModal(false)}
        onConfirm={() => runAction("reset-pw", () => setResetModal(false), "Password reset link sent")}
        loading={actionLoading === "reset-pw"}
        title="Reset password?"
        description={`A password reset link will be sent to ${activeStudent.email}. The link expires after 24 hours.`}
        confirmText="Send reset link"
        variant="primary"
        icon={RefreshCw}
      />

      <ConfirmDialog
        isOpen={revokeModal}
        onClose={() => setRevokeModal(false)}
        onConfirm={handleRevokeAccess}
        loading={actionLoading === "revoke"}
        title={accessRevoked ? "Reinstate access?" : "Revoke access?"}
        description={
          accessRevoked
            ? `${activeStudent.name} will regain full access to all course content.`
            : `${activeStudent.name} will lose access to all course content immediately. Their progress is preserved and access can be reinstated at any time.`
        }
        warning={accessRevoked ? undefined : "This action does not trigger a refund."}
        confirmText={accessRevoked ? "Reinstate access" : "Revoke access"}
        variant={accessRevoked ? "primary" : "destructive"}
        icon={AlertTriangle}
      />

      <ConfirmDialog
        isOpen={removeModal}
        onClose={() => setRemoveModal(false)}
        onConfirm={handleRemoveAccess}
        loading={actionLoading === "remove"}
        title="Remove access permanently?"
        description={`This will permanently remove ${activeStudent.name}'s account and course access from the database.`}
        warning="All course progress data will be deleted. This action cannot be reversed. Consider using Revoke Access if you may need to reinstate this student later."
        confirmText="Remove permanently"
        variant="destructive"
        icon={AlertTriangle}
      />
    </AdminLayout>
  );
}
