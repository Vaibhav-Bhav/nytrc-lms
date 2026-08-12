import React, { useState } from "react";
import { ArrowLeft, Mail } from "lucide-react";
import { Screen } from "../../../data/types";
import { AuthLayout } from "../../components/AuthLayout";
import { FormInput } from "../../components/FormInput";
import { Button } from "../../components/Button";

export function ForgotPasswordScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Failed to process password reset request.");
      } else {
        setSent(true);
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
        onClick={() => onNavigate?.("login")}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to login
      </button>

      {sent ? (
        <>
          <div className="w-10 h-10 rounded-full bg-success-light flex items-center justify-center mb-6">
            <Mail className="w-5 h-5 text-success-foreground" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">Check your email</h1>
          <p className="text-muted-foreground text-sm mb-1">We sent a reset link to</p>
          <p className="font-semibold text-foreground text-sm mb-8">{email}</p>
          <p className="text-muted-foreground text-sm">
            Didn't get it?{" "}
            <button onClick={() => setSent(false)} className="text-primary hover:underline font-semibold">
              Try again
            </button>
          </p>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-semibold text-foreground mb-1">Forgot your password?</h1>
          <p className="text-muted-foreground text-sm mb-8">Enter your email and we'll send a reset link.</p>
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-4 font-medium">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FormInput
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" loading={loading} className="w-full">
              Send reset link
            </Button>
          </form>
        </>
      )}
    </AuthLayout>
  );
}
