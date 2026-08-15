import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { authQueryKey } from "../../../hooks/useAuth";
import { AuthLayout } from "../../components/AuthLayout";
import { AuthStatusBanner } from "../../components/ErrorBanner";
import { FormInput } from "../../components/FormInput";
import { Button } from "../../components/Button";

type AuthStatus = "idle" | "loading" | "success" | "session-expired" | "unauthorized" | "logout-success";

export function LoginScreen({
  initialAuthStatus = "idle",
  initialEmail = "",
  onNavigate,
}: {
  initialAuthStatus?: AuthStatus;
  initialEmail?: string;
  onNavigate?: (s: any) => void;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState<AuthStatus>(initialAuthStatus);
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setAuthStatus("loading");

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json().catch(() => ({}));

      // Handle Backend Errors
      if (!response.ok) {
        setAuthStatus("idle");

        if (response.status === 401) {
          toast.error("Invalid email or password");
        } else if (response.status === 403) {
          if (data.code === 'TEMPORARY_CREDENTIAL_EXPIRED') {
            toast.error(data.error || "Your 72-hour temporary credential has expired. Please reset your password.");
          } else {
            toast.error(data.error || "Account access restricted");
          }
        } else if (response.status === 400 && data.error?.includes('device')) {
          // Navigate to the device limit screen
          const { pendingAuth } = await import('@/store/pendingAuth');
          pendingAuth.email = email;
          pendingAuth.password = password;
          if (onNavigate) onNavigate("auth-device-limit-exceeded");
          else navigate({ to: '/device-limit' });
        } else {
          toast.error(data.error || "Login failed");
        }
        return;
      }

      // Handle Success
      toast.success("Signed in successfully!");
      setAuthStatus("success");

      // Invalidate and prepopulate the auth query cache
      queryClient.setQueryData(authQueryKey, data.user);
      queryClient.invalidateQueries({ queryKey: authQueryKey });

      // Route based on forced password change status or role
      if (data.user?.force_password_change) {
        if (onNavigate) onNavigate("force-password");
        navigate({ to: '/force-password' });
      } else if (data.user?.role === 'admin') {
        if (onNavigate) onNavigate("admin-dashboard");
        window.location.href = '/admin/dashboard';
      } else {
        if (onNavigate) onNavigate("student-dashboard");
        window.location.href = '/student/dashboard';
      }

    } catch (err) {
      console.error("Login request failed:", err);
      toast.error("Network error. Is the server running?");
      setAuthStatus("idle");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-semibold text-foreground mb-1">Welcome back</h1>
      <p className="text-muted-foreground text-sm mb-6">Sign in to continue to your course.</p>

      {/* Auth status banner (handles session-expired, logout-success, etc.) */}
      <AuthStatusBanner status={authStatus} onDismiss={() => setAuthStatus("idle")} />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormInput
          label="Email address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-foreground">Password</label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 pr-10 text-sm rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex justify-end -mt-1">
          <button
            type="button"
            onClick={() => {
              if (onNavigate) onNavigate("forgot-password");
              else navigate({ to: "/forgot-password" });
            }}
            className="text-sm text-primary hover:underline font-medium"
          >
            Forgot password?
          </button>
        </div>

        <Button type="submit" loading={loading} className="w-full">
          Sign in
        </Button>
      </form>

      <div className="flex items-center justify-center mt-6">
        <p className="text-xs text-muted-foreground">
          Need help?{" "}
          <a href="mailto:support@nytrc.org" className="text-primary hover:underline">
            support@nytrc.org
          </a>
        </p>
      </div>
    </AuthLayout>
  );
}
