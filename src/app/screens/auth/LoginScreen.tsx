import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { AuthLayout } from "../../components/AuthLayout";
import { AuthStatusBanner } from "../../components/ErrorBanner";
import { FormInput } from "../../components/FormInput";
import { Button } from "../../components/Button";

type AuthStatus = "idle" | "loading" | "success" | "session-expired" | "unauthorized" | "logout-success";

interface LoginApiResponse {
  session_token: string;
  role: "admin" | "student";
  user?: {
    id: string;
    name?: string;
    email: string;
  };
}

export function LoginScreen({
  initialAuthStatus = "idle",
  onNavigate,
}: {
  initialAuthStatus?: AuthStatus;
  onNavigate?: (s: any) => void;
}) {
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState<AuthStatus>(initialAuthStatus);
  const [email, setEmail] = useState("");
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
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json().catch(() => ({}));

      // Handle Backend Errors
      if (!response.ok) {
        setAuthStatus("idle");

        if (response.status === 401) {
          toast.error("Invalid email or password");
        } else if (response.status === 403) {
          toast.error("Account locked");
        } else if (response.status === 400 && data.error?.includes('device')) {
          // Force a hard redirect to the device limit screen if router fails
          window.location.href = '/device-limit';
        } else {
          toast.error(data.error || "Login failed");
        }
        return;
      }

      // Handle Success
      toast.success("Signed in successfully!");
      setAuthStatus("success");

      // Route based on the user's role returned from the API
      if (data.user?.role === 'admin') {
        window.location.href = '/admin/dashboard';
      } else {
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
            onClick={() => navigate({ to: "/forgot-password" })}
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
