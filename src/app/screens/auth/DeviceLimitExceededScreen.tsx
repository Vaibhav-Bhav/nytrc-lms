import { useState, useEffect } from "react";
import { ShieldAlert, Laptop, Smartphone, Tablet, RefreshCw, LogOut, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Screen, DeviceSession } from "../../../data/types";
import { pendingAuth } from "../../../store/pendingAuth";
import { AuthLayout } from "../../components/AuthLayout";
import { Button, cn } from "../../components/Button";
import { Modal } from "../../components/Modal";
import { ConfirmDialog } from "../../components/ConfirmDialog";

export function DeviceLimitExceededScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [sessions, setSessions] = useState<DeviceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedDeviceToLogout, setSelectedDeviceToLogout] = useState<DeviceSession | null>(null);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [freedSession, setFreedSession] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    fetchActiveSessions();
  }, []);

  function handleContinue() {
    if (!pendingAuth.email) return;
    const email = pendingAuth.email;
    pendingAuth.clear();
    toast.success("Device slot freed! Please sign in now.");
    // We use window.location.href because we want to force a clean reload and pass the email
    // Or we could use navigate, but since we are changing routes and want it fast, let's just use href.
    // Wait, since we are in a SPA, we can just use router navigate if we have it.
    // But we don't have navigate here, we only have onNavigate.
    // We can just use window.location.href.
    window.location.href = `/login?email=${encodeURIComponent(email)}`;
  }

  async function fetchActiveSessions() {
    if (!pendingAuth.email) {
      toast.error("No pending login found, returning to login.");
      onNavigate?.("login");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/pending-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingAuth.email, password: pendingAuth.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load active sessions");
      setSessions(data.devices || []);
    } catch (e: any) {
      toast.error(e.message || "Failed to load active sessions");
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    if (!pendingAuth.email) return;
    setRefreshing(true);
    try {
      const res = await fetch("/api/auth/pending-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingAuth.email, password: pendingAuth.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to refresh sessions");
      setSessions(data.devices || []);
      toast.success("Session info updated");
    } catch (e: any) {
      toast.error(e.message || "Failed to refresh sessions");
    } finally {
      setRefreshing(false);
    }
  }

  function handleOpenLogoutConfirm(device: DeviceSession) {
    setSelectedDeviceToLogout(device);
    setLogoutConfirmOpen(true);
  }

  async function handleConfirmRevokeDevice() {
    if (!selectedDeviceToLogout || !pendingAuth.email) return;
    setRevoking(true);
    try {
      const res = await fetch("/api/auth/pending-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "revoke",
          sessionId: selectedDeviceToLogout.id,
          email: pendingAuth.email,
          password: pendingAuth.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to logout device");
      
      toast.success(`Logged out ${selectedDeviceToLogout.device_name}`);
      setFreedSession(true);
      setLogoutConfirmOpen(false);
      setSessions(data.devices || []);
    } catch (e: any) {
      toast.error(e.message || "Failed to logout device");
    } finally {
      setRevoking(false);
    }
  }

  function renderDeviceIcon(type?: string) {
    if (type === "mobile") return <Smartphone className="w-5 h-5 text-primary" />;
    if (type === "tablet") return <Tablet className="w-5 h-5 text-primary" />;
    return <Laptop className="w-5 h-5 text-primary" />;
  }

  return (
    <AuthLayout>
      <div className="w-12 h-12 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mb-5">
        <ShieldAlert className="w-6 h-6 text-destructive" />
      </div>

      <h1 className="text-2xl font-bold text-foreground mb-2">Maximum Active Device Limit Reached</h1>
      
      <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
        You can only use the LMS on two active devices at a time. Please logout from one of your existing devices to continue.
      </p>

      {/* Active devices overview box */}
      <div className="bg-muted/40 border border-border rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Current Active Sessions ({sessions.length}/2)
          </span>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1 text-xs text-primary hover:underline transition-colors"
          >
            <RefreshCw className={cn("w-3 h-3", refreshing && "animate-spin")} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="py-6 text-center text-xs text-muted-foreground">Loading active sessions...</div>
        ) : sessions.length === 0 ? (
          <div className="py-4 text-center text-xs text-muted-foreground">No active devices. You can sign in now!</div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {sessions.map((device) => (
              <div
                key={device.id}
                className="bg-card border border-border rounded-lg p-3 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {renderDeviceIcon(device.type)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">{device.device_name}</p>
                    <p className="text-muted-foreground text-[11px]">
                      {device.browser} • {device.os || "Active"} • {device.last_active || device.lastActive}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleOpenLogoutConfirm(device)}
                  className="px-2.5 py-1 text-xs font-medium text-destructive bg-destructive/10 hover:bg-destructive/20 rounded transition-colors"
                >
                  Logout
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {freedSession && (
        <div className="mb-6 p-3 bg-success-light border border-success/20 rounded-lg flex items-center gap-2 text-xs text-success-foreground font-medium">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>Device slot freed! You can now sign in to your dashboard.</span>
        </div>
      )}

      {/* Action buttons as specified */}
      <div className="flex flex-col gap-3">
        {freedSession ? (
          <Button onClick={handleContinue} loading={loggingIn} className="w-full">
            Continue to Dashboard
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              onClick={() => setViewModalOpen(true)}
              className="w-full flex justify-center items-center gap-2"
            >
              View Active Devices
            </Button>

            <Button
              variant="secondary"
              onClick={() => {
                if (sessions.length > 0) {
                  handleOpenLogoutConfirm(sessions[0]);
                } else {
                  toast.info("No active devices to logout.");
                }
              }}
              className="w-full flex justify-center items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout Another Device
            </Button>
          </>
        )}

        <Button
          variant="ghost"
          onClick={() => {
            pendingAuth.clear();
            onNavigate?.("login");
          }}
          className="w-full flex justify-center items-center gap-2 text-muted-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Return To Login
        </Button>
      </div>

      {/* Modal: View Active Devices */}
      <Modal isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} title="Active Devices List">
        <div className="p-4 flex flex-col gap-4">
          <p className="text-xs text-muted-foreground">
            Below are all devices currently signed in with active access to your LMS account. Maximum limit is 2 devices.
          </p>

          <div className="flex flex-col gap-3">
            {sessions.map((device) => (
              <div key={device.id} className="p-3.5 bg-card border border-border rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    {renderDeviceIcon(device.type)}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">{device.device_name}</h4>
                    <p className="text-xs text-muted-foreground">Browser: {device.browser}</p>
                    <p className="text-xs text-muted-foreground">OS: {device.os}</p>
                    <p className="text-xs text-muted-foreground">Last Active: {device.last_active || device.lastActive}</p>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setViewModalOpen(false);
                    handleOpenLogoutConfirm(device);
                  }}
                >
                  Logout
                </Button>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="outline" size="sm" onClick={() => setViewModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirm Dialog: Logout Another Device */}
      <ConfirmDialog
        isOpen={logoutConfirmOpen}
        onClose={() => setLogoutConfirmOpen(false)}
        onConfirm={handleConfirmRevokeDevice}
        title="Logout Another Device?"
        description={`Are you sure you want to end session for "${selectedDeviceToLogout?.device_name}"? This device will immediately lose access to the LMS.`}
        confirmText="Confirm Logout"
        loading={revoking}
        variant="destructive"
      />
    </AuthLayout>
  );
}
