import React, { useState } from "react";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Screen } from "../../../data/types";
import { authQueryKey, useAuth } from "../../../hooks/useAuth";
import { AuthLayout } from "../../components/AuthLayout";
import { FormInput } from "../../components/FormInput";
import { Button } from "../../components/Button";

export function ForcePasswordScreen({ onNavigate }: { onNavigate?: (s: Screen) => void }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const isTooShort = newPassword.length > 0 && newPassword.length < 8;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (mismatch) {
      setErrorMsg("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setErrorMsg("New password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrorMsg(data.error || "Failed to change password.");
        toast.error(data.error || "Password change failed.");
        return;
      }

      toast.success("Password updated successfully!");

      // Refresh auth cache so force_password_change becomes false
      await queryClient.invalidateQueries({ queryKey: authQueryKey });

      // Navigate based on user role
      if (user?.role === "admin") {
        if (onNavigate) onNavigate("admin-dashboard");
        else navigate({ to: "/admin/dashboard" });
      } else {
        if (onNavigate) onNavigate("student-dashboard");
        else navigate({ to: "/student/dashboard" });
      }
    } catch (err: any) {
      console.error("[ForcePasswordScreen] Change password failed:", err);
      setErrorMsg("Network error. Please try again.");
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
        <Lock className="w-6 h-6 text-primary" />
      </div>
      <h1 className="text-2xl font-extrabold text-foreground mb-1">Change Temporary Password</h1>
      <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
        Your account was set up with a temporary password. For security, please choose a permanent password within 72 hours of receiving your credentials.
      </p>

      {errorMsg && (
        <div className="mb-5 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Current Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-foreground">Current / Temporary Password</label>
          <div className="relative">
            <input
              type={showCurrentPw ? "text" : "password"}
              placeholder="Enter temporary password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 pr-10 text-sm rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrentPw(!showCurrentPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-foreground">New Password</label>
          <div className="relative">
            <input
              type={showNewPw ? "text" : "password"}
              placeholder="At least 8 characters with letters & numbers"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 pr-10 text-sm rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              required
            />
            <button
              type="button"
              onClick={() => setShowNewPw(!showNewPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {isTooShort && <p className="text-xs text-destructive">Password must be at least 8 characters.</p>}
        </div>

        {/* Confirm New Password */}
        <FormInput
          label="Confirm New Password"
          type="password"
          placeholder="Repeat your new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={mismatch ? "Passwords do not match." : undefined}
          required
        />

        <Button type="submit" loading={loading} disabled={mismatch || newPassword.length < 8 || !currentPassword} className="w-full mt-2">
          Update password & continue
        </Button>
      </form>
    </AuthLayout>
  );
}
