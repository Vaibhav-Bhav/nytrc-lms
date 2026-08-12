import React, { useState } from "react";
import { ArrowLeft, CheckCircle2, KeyRound } from "lucide-react";
import { AuthLayout } from "../../components/AuthLayout";
import { FormInput } from "../../components/FormInput";
import { Button } from "../../components/Button";

interface ResetPasswordScreenProps {
  token: string;
  onNavigateLogin: () => void;
}

export function ResetPasswordScreen({ token, onNavigateLogin }: ResetPasswordScreenProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!token || !token.trim()) {
      setError("Missing password reset token. Please request a new reset link.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token.trim(),
          new_password: newPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Failed to reset password. The link may be invalid or expired.");
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err?.message || "A network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <button
        onClick={onNavigateLogin}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to login
      </button>

      {success ? (
        <>
          <div className="w-10 h-10 rounded-full bg-success-light flex items-center justify-center mb-6">
            <CheckCircle2 className="w-5 h-5 text-success-foreground" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">Password Reset Complete!</h1>
          <p className="text-muted-foreground text-sm mb-8">
            Your password has been updated successfully. All active sessions have been invalidated for security.
          </p>
          <Button onClick={onNavigateLogin} className="w-full">
            Log in with new password
          </Button>
        </>
      ) : (
        <>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <KeyRound className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-1">Set new password</h1>
          <p className="text-muted-foreground text-sm mb-8">
            Please enter a new strong password for your account.
          </p>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-4 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FormInput
              label="New password"
              type="password"
              placeholder="At least 8 chars, 1 uppercase, 1 number"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <FormInput
              label="Confirm new password"
              type="password"
              placeholder="Re-enter your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <Button type="submit" loading={loading} className="w-full">
              Reset password
            </Button>
          </form>
        </>
      )}
    </AuthLayout>
  );
}
