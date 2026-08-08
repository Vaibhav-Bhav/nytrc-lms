import { useState, useEffect } from "react";
import { ArrowLeft, Monitor, Smartphone, Tablet, RefreshCw, Shield, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Screen, DeviceSession } from "../../../data/types";
import { sessionService } from "../../../services/sessionService";
import { AuthLayout } from "../../components/AuthLayout";
import { Button, cn } from "../../components/Button";
import { SupportCard } from "../../components/SupportCard";
import { ConfirmDialog } from "../../components/ConfirmDialog";

export function DeviceSessionScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [sessions, setSessions] = useState<DeviceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modals state
  const [selectedDevice, setSelectedDevice] = useState<DeviceSession | null>(null);
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [logoutAllModalOpen, setLogoutAllModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    setLoading(true);
    try {
      const res = await sessionService.getSessions();
      setSessions(res.devices);
    } catch (e) {
      toast.error("Failed to load active sessions");
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    try {
      const res = await sessionService.getSessions();
      setSessions(res.devices);
      toast.success("Session info refreshed");
    } catch (e) {
      toast.error("Failed to refresh session data");
    } finally {
      setRefreshing(false);
    }
  }

  function triggerRevokeDevice(device: DeviceSession) {
    setSelectedDevice(device);
    setRevokeModalOpen(true);
  }

  async function handleConfirmRevoke() {
    if (!selectedDevice) return;
    setActionLoading(true);
    try {
      if (selectedDevice.is_current_device) {
        await sessionService.logoutCurrentSession();
        toast.success("Current session logged out");
        onNavigate("login");
      } else {
        const res = await sessionService.revokeSession(selectedDevice.id);
        setSessions(res.devices);
        toast.success(`Session for ${selectedDevice.device_name} revoked`);
      }
    } catch (e) {
      toast.error("Failed to revoke session");
    } finally {
      setActionLoading(false);
      setRevokeModalOpen(false);
      setSelectedDevice(null);
    }
  }

  async function handleConfirmLogoutAll() {
    setActionLoading(true);
    try {
      const res = await sessionService.logoutAllSessions();
      setSessions(res.devices);
      toast.success("All device sessions logged out");
      onNavigate("login");
    } catch (e) {
      toast.error("Failed to logout all sessions");
    } finally {
      setActionLoading(false);
      setLogoutAllModalOpen(false);
    }
  }

  function renderDeviceIcon(type?: string) {
    if (type === "mobile") return <Smartphone className="w-4 h-4" />;
    if (type === "tablet") return <Tablet className="w-4 h-4" />;
    return <Monitor className="w-4 h-4" />;
  }

  return (
    <AuthLayout>
      <button
        onClick={() => onNavigate("student-account")}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to account
      </button>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Monitor className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Active device sessions</h1>
            <p className="text-xs text-muted-foreground">Limit: 2 active devices per student account</p>
          </div>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
          title="Refresh Sessions"
        >
          <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
        </button>
      </div>

      <div className="flex items-center justify-between bg-muted/30 border border-border px-3.5 py-2.5 rounded-lg mb-5 text-xs">
        <span className="text-muted-foreground font-medium">Total Active Devices</span>
        <span className="font-bold text-primary px-2 py-0.5 bg-primary/10 rounded">
          {sessions.filter(s => s.status === "active").length} / 2
        </span>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">Loading session details...</div>
      ) : (
        <div className="flex flex-col gap-3">
          {sessions.map((session) => (
            <div key={session.id} className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
              <div
                className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
                  session.is_current_device ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                )}
              >
                {renderDeviceIcon(session.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-foreground">{session.device_name}</p>
                  {session.is_current_device && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                      Current device
                    </span>
                  )}
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded font-medium uppercase",
                      session.status === "active" ? "bg-success-light text-success-foreground border border-success/20" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {session.status}
                  </span>
                </div>

                <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                  <p>
                    <span className="font-medium text-foreground/80">Browser:</span> {session.browser} • <span className="font-medium text-foreground/80">OS:</span> {session.os}
                  </p>
                  <p>
                    <span className="font-medium text-foreground/80">Login:</span> {session.login_time}
                  </p>
                  <p>
                    <span className="font-medium text-foreground/80">Last active:</span> {session.last_active || session.lastActive}
                  </p>
                </div>
              </div>

              <Button
                variant="destructive"
                size="sm"
                onClick={() => triggerRevokeDevice(session)}
                className="flex-shrink-0"
              >
                {session.is_current_device ? "Logout" : "Revoke"}
              </Button>
            </div>
          ))}

          {sessions.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">No active sessions found.</p>
          )}

          {sessions.length > 0 && (
            <div className="mt-4 pt-3 border-t border-border flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLogoutAllModalOpen(true)}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Logout From All Devices
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Revoke confirmation dialog */}
      <ConfirmDialog
        isOpen={revokeModalOpen}
        onClose={() => setRevokeModalOpen(false)}
        onConfirm={handleConfirmRevoke}
        title={selectedDevice?.is_current_device ? "Logout Current Device?" : "Revoke Session?"}
        description={
          selectedDevice?.is_current_device
            ? "Are you sure you want to log out of your current device session? You will need to sign in again to access the LMS."
            : `Are you sure you want to revoke the session for "${selectedDevice?.device_name}"? This device will immediately lose access to the LMS.`
        }
        confirmText={selectedDevice?.is_current_device ? "Logout Current Device" : "Revoke Session"}
        loading={actionLoading}
        variant="destructive"
      />

      {/* Logout All confirmation dialog */}
      <ConfirmDialog
        isOpen={logoutAllModalOpen}
        onClose={() => setLogoutAllModalOpen(false)}
        onConfirm={handleConfirmLogoutAll}
        title="Logout From All Devices?"
        description="Are you sure you want to log out of ALL active devices? Every device (including this one) will immediately lose access to the LMS."
        confirmText="Logout All Devices"
        loading={actionLoading}
        variant="destructive"
      />

      <SupportCard type="login" className="mt-5" />
    </AuthLayout>
  );
}
