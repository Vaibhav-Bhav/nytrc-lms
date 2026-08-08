import React, { useState } from "react";
import { Lock } from "lucide-react";
import { Screen } from "../../../data/types";
import { AuthLayout } from "../../components/AuthLayout";
import { FormInput } from "../../components/FormInput";
import { Button } from "../../components/Button";

export function ForcePasswordScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [loading, setLoading] = useState(false);
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const mismatch = confirm.length > 0 && pw !== confirm;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mismatch || pw.length < 8) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onNavigate("auth-password-changed");
    }, 1000);
  }

  return (
    <AuthLayout>
      <div className="w-10 h-10 rounded-full bg-warning-light flex items-center justify-center mb-6">
        <Lock className="w-5 h-5 text-warning-foreground" />
      </div>
      <h1 className="text-2xl font-semibold text-foreground mb-1">Set a new password</h1>
      <p className="text-muted-foreground text-sm mb-8">
        Your temporary password has expired. Set a new one to continue.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormInput
          label="New password"
          type="password"
          placeholder="At least 8 characters"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          required
        />
        <FormInput
          label="Confirm new password"
          type="password"
          placeholder="Repeat your new password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={mismatch ? "Passwords do not match." : undefined}
          required
        />
        <Button type="submit" loading={loading} disabled={mismatch || pw.length < 8} className="w-full mt-1">
          Set password and continue
        </Button>
      </form>
    </AuthLayout>
  );
}
