import { useState } from "react";
import { ArrowLeft, Check, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Screen } from "../../../data/types";
import { INITIAL_STUDENTS } from "../../../data/mockData";
import { AdminLayout } from "../../components/AdminLayout";
import { Breadcrumb } from "../../components/Breadcrumb";
import { Badge } from "../../components/Badge";
import { Button, cn } from "../../components/Button";
import { NotificationStatus } from "../../components/NotificationStatus";
import { SupportCard } from "../../components/SupportCard";

const REFUND_STEPS = [
  { id: "requested", label: "Refund Requested", desc: "Student submitted a refund request.", time: "2024-12-20 10:14" },
  { id: "approved", label: "Refund Approved", desc: "Admin reviewed and approved the refund.", time: "2024-12-20 11:30" },
  { id: "revoked", label: "Access Revoked", desc: "Course access has been removed.", time: null },
  { id: "notified", label: "Student Notified", desc: "Confirmation email sent to student.", time: null },
  { id: "completed", label: "Refund Completed", desc: "Funds returned to original payment method.", time: null },
] as const;

export function AdminRefundFlow({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const student = INITIAL_STUDENTS[0];
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [advancing, setAdvancing] = useState(false);
  const [notifStep, setNotifStep] = useState<number | null>(null);

  const stepActions: Record<number, string> = {
    1: "Revoke Access",
    2: "Notify Student",
    3: "Mark Refund Complete",
  };

  function advanceStep() {
    if (currentStep >= REFUND_STEPS.length - 1) return;
    setAdvancing(true);
    setTimeout(() => {
      setAdvancing(false);
      const next = currentStep + 1;
      setCurrentStep(next);
      setNotifStep(next);
      toast.success(`${REFUND_STEPS[next].label} — step completed`);
      setTimeout(() => setNotifStep(null), 3000);
    }, 1200);
  }

  return (
    <AdminLayout current="admin-refund" onNavigate={onNavigate}>
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="max-w-[800px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
          <div className="mb-4">
            <Breadcrumb
              items={[
                { label: "Admin" },
                { label: "Students", onClick: () => onNavigate("admin-students") },
                { label: student.name, onClick: () => onNavigate("admin-student-detail") },
                { label: "Refund Flow" },
              ]}
            />
          </div>

          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <button
              onClick={() => onNavigate("admin-student-detail")}
              className="p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Refund Flow</h1>
              <p className="text-muted-foreground text-sm mt-0.5 font-medium">
                {student.name} · {student.email}
              </p>
            </div>
          </div>

          <div className="max-w-2xl flex flex-col gap-6">
            <div className="bg-card rounded-2xl border border-border shadow-sm p-5 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Student</p>
                  <p className="text-sm font-bold text-foreground mt-0.5">{student.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Refund Amount</p>
                  <p className="text-sm font-bold text-foreground mt-0.5">₹14,750</p>
                  <p className="text-xs text-muted-foreground">Order: ORD-2024-001</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Current Status</p>
                  <div className="mt-0.5">
                    <Badge variant={currentStep >= REFUND_STEPS.length - 1 ? "refund-complete" : "refund-pending"} />
                  </div>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">
                    Step {currentStep + 1} of {REFUND_STEPS.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border shadow-sm p-5 sm:p-6">
              <h2 className="font-bold text-foreground text-base mb-5">Refund Pipeline</h2>
              <div className="space-y-1">
                {REFUND_STEPS.map((step, i) => {
                  const isCompleted = i <= currentStep;
                  const isCurrent = i === currentStep;
                  const isPending = i > currentStep;
                  const showNotif = notifStep === i;

                  return (
                    <div key={step.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-all duration-300",
                            isCompleted && !isCurrent
                              ? "bg-success"
                              : isCurrent
                              ? "border-2 border-primary bg-primary-light"
                              : "border-2 border-border bg-card"
                          )}
                        >
                          {isCompleted && !isCurrent ? (
                            <Check className="w-4 h-4 text-white" />
                          ) : isCurrent ? (
                            <div className="w-2 h-2 rounded-full bg-primary" />
                          ) : (
                            <span className="text-xs text-muted-foreground font-semibold">{i + 1}</span>
                          )}
                        </div>
                        {i < REFUND_STEPS.length - 1 && (
                          <div
                            className={cn(
                              "w-0.5 flex-1 my-1 min-h-[20px] rounded-full transition-colors",
                              i < currentStep ? "bg-success" : "bg-border"
                            )}
                          />
                        )}
                      </div>

                      <div className={cn("flex-1 min-w-0 pb-5", i === REFUND_STEPS.length - 1 && "pb-0")}>
                        <div className="flex items-start justify-between gap-3 mb-0.5">
                          <p
                            className={cn(
                              "text-sm font-bold",
                              isCompleted ? "text-foreground" : isPending ? "text-muted-foreground" : "text-foreground"
                            )}
                          >
                            {step.label}
                          </p>
                          {step.time && isCompleted && !isCurrent && (
                            <span className="text-xs text-muted-foreground flex-shrink-0">{step.time}</span>
                          )}
                          {isCurrent && (
                            <span className="text-xs bg-primary-light text-primary px-2 py-0.5 rounded-md font-bold flex-shrink-0">
                              Current
                            </span>
                          )}
                        </div>
                        <p className={cn("text-xs leading-relaxed font-medium", isCompleted ? "text-muted-foreground" : "text-muted-foreground/50")}>
                          {step.desc}
                        </p>
                        {showNotif && (
                          <div className="mt-2">
                            <NotificationStatus state="sent" label="Step completed · Student notified" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {currentStep < REFUND_STEPS.length - 1 && (
              <div className="bg-card rounded-2xl border border-border shadow-sm p-5 sm:p-6">
                <h2 className="font-bold text-foreground text-base mb-1">Next action</h2>
                <p className="text-sm text-muted-foreground mb-4 font-medium">
                  Proceed to: <strong className="text-foreground font-bold">{REFUND_STEPS[currentStep + 1].label}</strong>
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button loading={advancing} onClick={advanceStep} className="flex-1 sm:flex-none">
                    {stepActions[currentStep] ?? "Advance"} <ArrowRight className="w-4 h-4" />
                  </Button>
                  <Button variant="secondary" onClick={() => onNavigate("admin-student-detail")}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {currentStep >= REFUND_STEPS.length - 1 && (
              <div className="bg-success-light rounded-2xl border border-success/20 p-5 sm:p-6 text-center">
                <CheckCircle2 className="w-10 h-10 text-success-foreground mx-auto mb-3" />
                <h2 className="font-bold text-success-foreground mb-1 text-base">Refund Completed</h2>
                <p className="text-sm text-success-foreground/80 leading-relaxed font-medium">
                  The refund has been processed and the student has been notified. Funds should appear within 5–7 business days.
                </p>
              </div>
            )}

            <SupportCard type="payment" />
          </div>
        </div>
      </main>
    </AdminLayout>
  );
}
