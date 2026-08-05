import React, { useState } from "react";
import { Eye, EyeOff, Laptop, Smartphone, Tablet, ShieldAlert, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Screen } from "../../../data/types";
import { sessionService } from "../../../services/sessionService";
import { AuthLayout } from "../../components/AuthLayout";
import { ErrorBanner } from "../../components/ErrorBanner";
import { FormInput } from "../../components/FormInput";
import { Button } from "../../components/Button";

export function LoginScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoError, setDemoError] = useState(false);
  const [email, setEmail] = useState("sarah.chen@example.com");
  const [password, setPassword] = useState("secure-password");

  // Device simulation state for easy prototype testing
  const [simulatedDevice, setSimulatedDevice] = useState<"desktop" | "mobile" | "tablet" | "3rd-device">("desktop");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (demoError) {
      setDemoError(false);
      return;
    }
    setLoading(true);

    try {
      if (email.toLowerCase().includes("admin")) {
        // Admin login bypasses student device limit check
        setTimeout(() => {
          setLoading(false);
          onNavigate("admin-dashboard");
        }, 600);
        return;
      }

      // Determine simulated device preset for testing
      let devicePreset;
      if (simulatedDevice === "3rd-device") {
        devicePreset = {
          device_name: "iPad Air 5th Gen",
          browser: "Safari",
          os: "iPadOS 17",
          type: "tablet" as const,
        };
      } else if (simulatedDevice === "mobile") {
        devicePreset = {
          device_name: "iPhone 15 Pro",
          browser: "Safari",
          os: "iOS 17",
          type: "mobile" as const,
        };
      }

      // Call API ready session service
      const res = await sessionService.login(email, password, devicePreset);

      if (!res.success && res.max_limit_reached) {
        toast.error("Login blocked: Maximum active device limit reached (2/2)");
        onNavigate("auth-device-limit-exceeded");
      } else {
        toast.success("Signed in successfully");
        onNavigate("student-dashboard");
      }
    } catch (err) {
      toast.error("Login failed. Please check credentials.");
    } finally {
      setLoading(false);
    }
  }

  // Quick reset helper for testing device limits
  async function handleResetSessionsSeed() {
    await sessionService.resetSessionsToSeed();
    toast.info("Active sessions reset to 2 default devices");
  }

  async function handleTrigger3rdDeviceBlock() {
    // Fill 2 sessions with mock devices first so that this attempt is strictly the 3rd
    localStorage.setItem(
      "lms_active_device_sessions",
      JSON.stringify([
        {
          id: "dev_mock_1",
          device_name: "Windows Laptop",
          browser: "Chrome",
          os: "Windows 11",
          login_time: "Today, 09:00 AM",
          last_active: "10 mins ago",
          is_current_device: false,
          status: "active",
          type: "desktop",
        },
        {
          id: "dev_mock_2",
          device_name: "Android Mobile",
          browser: "Chrome",
          os: "Android 14",
          login_time: "Today, 08:30 AM",
          last_active: "30 mins ago",
          is_current_device: false,
          status: "active",
          type: "mobile",
        },
      ])
    );
    // Set current device ID to something else so this login represents a 3rd device
    localStorage.setItem("lms_current_device_id", "dev_mock_3rd_device");
    setSimulatedDevice("3rd-device");
    toast.warning("Configured 2 active sessions. Clicking 'Sign in' will trigger Device Limit Exceeded screen.");
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-semibold text-foreground mb-1">Welcome back</h1>
      <p className="text-muted-foreground text-sm mb-6">Sign in to continue to your course.</p>
      
      {demoError && (
        <ErrorBanner
          message="Invalid email or password. 4 attempts remaining before your account is locked."
          type="error"
          onDismiss={() => setDemoError(false)}
          className="mb-5"
        />
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
        
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-foreground">Password</label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 pr-10 text-sm rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              required
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex justify-between -mt-1">
          <button
            type="button"
            onClick={() => setDemoError(true)}
            className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          >
            Demo error
          </button>
          <button
            type="button"
            onClick={() => onNavigate("forgot-password")}
            className="text-sm text-primary hover:underline"
          >
            Forgot password?
          </button>
        </div>

        <Button type="submit" loading={loading} className="w-full">
          Sign in
        </Button>
      </form>

      {/* Role & Session Limit Simulator */}
      <div className="mt-5 p-3.5 bg-muted/40 rounded-xl border border-border flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            2-Device Limit Tester
          </span>
          <button
            type="button"
            onClick={handleResetSessionsSeed}
            className="text-[11px] text-muted-foreground hover:text-foreground underline"
          >
            Reset Sessions
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleTrigger3rdDeviceBlock}
            className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-medium p-2 rounded-lg hover:bg-amber-500/20 text-left transition-colors flex items-center gap-1.5"
          >
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            Test 3rd Device Limit Block
          </button>

          <button
            type="button"
            onClick={() => {
              setEmail("sarah.chen@example.com");
              setPassword("secure-password");
              toast.info("Set credentials for Student Sarah Chen");
            }}
            className="text-xs bg-card border border-border text-foreground font-medium p-2 rounded-lg hover:bg-muted text-left transition-colors flex items-center gap-1.5"
          >
            <Laptop className="w-4 h-4 text-primary flex-shrink-0" />
            Normal Student Sign In
          </button>
        </div>
      </div>

      {/* Quick Switch */}
      <div className="mt-3 p-3 bg-muted/40 rounded-lg border border-border flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium">Quick switch:</span>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEmail("admin@nytrc.edu");
              setPassword("admin123");
              onNavigate("admin-dashboard");
            }}
            className="text-xs bg-primary/10 text-primary font-semibold px-2 py-1 rounded hover:bg-primary/20 transition-colors"
          >
            Admin Login
          </button>
          <button
            onClick={() => {
              setEmail("sarah.chen@example.com");
              setPassword("secure-password");
              onNavigate("student-dashboard");
            }}
            className="text-xs bg-muted text-foreground font-semibold px-2 py-1 rounded hover:bg-muted/80 transition-colors"
          >
            Student Login
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mt-5">
        <p className="text-xs text-muted-foreground">
          Need help? <a href="#" className="text-primary hover:underline">support@nytrc.edu</a>
        </p>
        <button
          onClick={() => onNavigate("auth-device-limit-exceeded")}
          className="text-xs text-muted-foreground/60 hover:text-primary transition-colors font-medium"
        >
          Device Limit Screen →
        </button>
      </div>
    </AuthLayout>
  );
}
