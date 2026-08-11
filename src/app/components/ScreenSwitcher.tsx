import { useState } from "react";
import { Layers } from "lucide-react";
import { Screen } from "../../data/types";
import { cn } from "./Button";

export const SCREEN_GROUPS = [
  {
    label: "Auth",
    screens: [
      { id: "login" as Screen, label: "Login" },
      { id: "force-password" as Screen, label: "Force Password" },
      { id: "forgot-password" as Screen, label: "Forgot Password" },
      { id: "auth-locked" as Screen, label: "Account Locked" },
      { id: "auth-session-expired" as Screen, label: "Session Expired" },
      { id: "auth-device-session" as Screen, label: "Device Sessions" },
      { id: "auth-device-limit-exceeded" as Screen, label: "Device Limit Exceeded" },
      { id: "auth-password-changed" as Screen, label: "Password Changed" },
      { id: "checkout" as Screen, label: "Checkout" },
    ],
  },
  {
    label: "Payment",
    screens: [
      { id: "payment-processing" as Screen, label: "Processing" },
      { id: "payment-success" as Screen, label: "Success" },
      { id: "payment-failed" as Screen, label: "Failed" },
      { id: "payment-pending" as Screen, label: "Pending" },
    ],
  },
  {
    label: "Student",
    screens: [
      { id: "student-dashboard" as Screen, label: "Dashboard" },
      { id: "student-course-detail" as Screen, label: "Course Detail" },
      { id: "course-player" as Screen, label: "Course Player" },
      { id: "student-account" as Screen, label: "Account" },
    ],
  },
  {
    label: "Admin",
    screens: [
      { id: "admin-dashboard" as Screen, label: "Dashboard" },
      { id: "admin-create-course" as Screen, label: "Create Course" },
      { id: "admin-content" as Screen, label: "Content Editor" },
      { id: "admin-students" as Screen, label: "Students" },
      { id: "admin-student-detail" as Screen, label: "Student Detail" },
      { id: "admin-refund" as Screen, label: "Refund Flow" },
    ],
  },
  {
    label: "States",
    screens: [
      { id: "skel-dashboard" as Screen, label: "Skel: Dashboard" },
      { id: "skel-player" as Screen, label: "Skel: Player" },
      { id: "skel-admin-table" as Screen, label: "Skel: Table" },
      { id: "empty-student" as Screen, label: "Empty: Student" },
      { id: "empty-admin-students" as Screen, label: "Empty: Students" },
      { id: "empty-admin-content" as Screen, label: "Empty: Content" },
      { id: "error-content" as Screen, label: "Error: Content" },
    ],
  },
];

export function ScreenSwitcher({ current, onNavigate }: { current?: Screen; onNavigate: (s: Screen) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-3 bg-card rounded-xl shadow-2xl border border-border p-4 w-64 max-h-[72vh] overflow-y-auto">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Jump to screen</p>
          {SCREEN_GROUPS.map((group) => (
            <div key={group.label} className="mb-3 last:mb-0">
              <p className="text-xs font-semibold text-muted-foreground mb-1.5">{group.label}</p>
              <div className="flex flex-col gap-0.5">
                {group.screens.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      onNavigate?.(s.id);
                      setOpen(false);
                    }}
                    className={cn(
                      "text-left px-2.5 py-1.5 rounded-lg text-sm transition-colors",
                      current === s.id ? "bg-primary text-primary-foreground font-medium" : "text-foreground hover:bg-muted"
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-foreground text-background px-4 py-2.5 rounded-full shadow-lg text-sm font-semibold hover:opacity-80 transition-opacity"
      >
        <Layers className="w-4 h-4" />
        {open ? "Close" : "All screens"}
      </button>
    </div>
  );
}
