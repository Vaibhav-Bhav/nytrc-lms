import React, { useState, useEffect } from "react";
import { User, Monitor, Smartphone, Tablet, RefreshCw, LogOut, ShieldCheck, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Screen, DeviceSession } from "../../../data/types";
import { PAYMENT_HISTORY } from "../../../data/mockData";
import { sessionService } from "../../../services/sessionService";
import { StudentLayout } from "../../components/StudentNav";
import { FormInput } from "../../components/FormInput";
import { Button, cn } from "../../components/Button";
import { InvoiceCard } from "../../components/InvoiceCard";
import { ConfirmDialog } from "../../components/ConfirmDialog";

export function StudentAccount({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Active Sessions state
  const [sessions, setSessions] = useState<DeviceSession[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [maxDevices, setMaxDevices] = useState(2);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals state
  const [selectedDevice, setSelectedDevice] = useState<DeviceSession | null>(null);
  const [confirmLogoutModal, setConfirmLogoutModal] = useState(false);
  const [confirmLogoutAllModal, setConfirmLogoutAllModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchSessionInfo();
  }, []);

  async function fetchSessionInfo() {
    setLoadingSessions(true);
    try {
      const res = await sessionService.getSessions();
      setSessions(res.devices);
      setActiveCount(res.active_devices);
      setMaxDevices(res.max_devices);
    } catch (e) {
      toast.error("Failed to load session details");
    } finally {
      setLoadingSessions(false);
    }
  }

  async function handleRefreshSessions() {
    setRefreshing(true);
    try {
      const res = await sessionService.getSessions();
      setSessions(res.devices);
      setActiveCount(res.active_devices);
      setMaxDevices(res.max_devices);
      toast.success("Session information refreshed");
    } catch (e) {
      toast.error("Failed to refresh session data");
    } finally {
      setRefreshing(false);
    }
  }

  function handleOpenLogoutDeviceModal(device: DeviceSession) {
    setSelectedDevice(device);
    setConfirmLogoutModal(true);
  }

  async function handleConfirmLogoutDevice() {
    if (!selectedDevice) return;
    setActionLoading(true);
    try {
      if (selectedDevice.is_current_device) {
        await sessionService.logoutCurrentSession();
        toast.success("Current device logged out");
        onNavigate("login");
      } else {
        const res = await sessionService.revokeSession(selectedDevice.id);
        setSessions(res.devices);
        setActiveCount(res.active_devices);
        toast.success(`Logged out ${selectedDevice.device_name}`);
      }
    } catch (e) {
      toast.error("Failed to logout device session");
    } finally {
      setActionLoading(false);
      setConfirmLogoutModal(false);
      setSelectedDevice(null);
    }
  }

  async function handleConfirmLogoutAll() {
    setActionLoading(true);
    try {
      const res = await sessionService.logoutAllSessions();
      setSessions(res.devices);
      setActiveCount(res.active_devices);
      toast.success("Logged out from all devices");
      onNavigate("login");
    } catch (e) {
      toast.error("Failed to logout all sessions");
    } finally {
      setActionLoading(false);
      setConfirmLogoutAllModal(false);
    }
  }

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordLoading(true);
    setTimeout(() => {
      setPasswordLoading(false);
      toast.success("Password updated successfully");
    }, 1000);
  }

  function renderDeviceIcon(type?: string) {
    if (type === "mobile") return <Smartphone className="w-5 h-5 text-primary" />;
    if (type === "tablet") return <Tablet className="w-5 h-5 text-primary" />;
    return <Monitor className="w-5 h-5 text-primary" />;
  }

  return (
    <StudentLayout current="student-account" onNavigate={onNavigate}>
      <main className="flex-1 max-w-[1100px] w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-6">Account Settings</h1>

        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-5 sm:px-6 py-4 border-b border-border bg-muted/20">
              <h2 className="font-bold text-foreground text-base">Profile Overview</h2>
            </div>
            <div className="px-5 sm:px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="text-base font-extrabold text-white">SC</span>
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-foreground text-base">Sarah Chen</p>
                  <p className="text-sm text-muted-foreground truncate">sarah.chen@example.com</p>
                </div>
              </div>
              <span className="text-xs px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/40 font-semibold rounded-full flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Student Account
              </span>
            </div>
          </div>

          {/* ACTIVE DEVICE SESSIONS SECTION */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-5 sm:px-6 py-4 border-b border-border bg-muted/20 flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="font-bold text-foreground text-base flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-primary" />
                  Active Device Sessions
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Maximum limit of 2 active device sessions per student account.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold px-3 py-1 bg-primary/10 text-primary rounded-xl border border-primary/20">
                  Active Devices : {activeCount} / {maxDevices}
                </span>
                <button
                  onClick={handleRefreshSessions}
                  disabled={refreshing}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors cursor-pointer"
                  title="Refresh Session Info"
                >
                  <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
                </button>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              {loadingSessions ? (
                <div className="py-8 text-center text-sm text-muted-foreground">Loading device sessions...</div>
              ) : (
                <div className="flex flex-col gap-4">
                  {sessions.map((device, index) => (
                    <div
                      key={device.id}
                      className="p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                    >
                      <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0">
                          {renderDeviceIcon(device.type)}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-sm font-bold text-foreground">
                              {index + 1}. {device.device_name}
                            </span>
                            {device.is_current_device && (
                              <span className="text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-md font-bold border border-primary/20">
                                Current Device
                              </span>
                            )}
                            <span
                              className={cn(
                                "text-[10px] px-1.5 py-0.5 rounded font-bold uppercase",
                                device.status === "active"
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                  : "bg-muted text-muted-foreground"
                              )}
                            >
                              Session: {device.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                            <p>
                              <span className="font-semibold text-foreground">Browser:</span> {device.browser}
                            </p>
                            <p>
                              <span className="font-semibold text-foreground">OS:</span> {device.os}
                            </p>
                            <p>
                              <span className="font-semibold text-foreground">Login Time:</span> {device.login_time}
                            </p>
                            <p>
                              <span className="font-semibold text-foreground">Last Active:</span>{" "}
                              {device.last_active || device.lastActive}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleOpenLogoutDeviceModal(device)}
                          className="text-xs"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          {device.is_current_device ? "Logout" : "Logout Device"}
                        </Button>
                      </div>
                    </div>
                  ))}

                  {sessions.length === 0 && (
                    <div className="py-6 text-center text-sm text-muted-foreground">No active device sessions found.</div>
                  )}

                  <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border mt-2">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <AlertCircle className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      <span>Attempting to log in from a 3rd device will be automatically blocked.</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onNavigate("auth-device-session")}
                        className="text-xs font-bold text-primary hover:underline cursor-pointer"
                      >
                        Manage Full Sessions →
                      </button>
                      {sessions.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setConfirmLogoutAllModal(true)}
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive text-xs"
                        >
                          Logout All Devices
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Change password card */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-5 sm:px-6 py-4 border-b border-border bg-muted/20">
              <h2 className="font-bold text-foreground text-base">Security & Password</h2>
            </div>
            <form onSubmit={handlePasswordSubmit} className="px-5 sm:px-6 py-5 flex flex-col gap-4">
              <FormInput label="Current password" type="password" placeholder="••••••••" required />
              <FormInput label="New password" type="password" placeholder="At least 8 characters" required />
              <FormInput label="Confirm new password" type="password" placeholder="Repeat new password" required />
              <Button type="submit" loading={passwordLoading} className="w-full sm:w-auto self-start">
                Update password
              </Button>
            </form>
          </div>

          {/* Past Invoices */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-5 sm:px-6 py-4 border-b border-border bg-muted/20">
              <h2 className="font-bold text-foreground text-base">Billing & Invoices</h2>
            </div>
            {PAYMENT_HISTORY.map((inv) => (
              <InvoiceCard key={inv.id} inv={inv} onDownload={() => toast.success("Invoice downloaded")} />
            ))}
          </div>
        </div>
      </main>

      {/* Confirmation Modal: Logout Individual Device */}
      <ConfirmDialog
        isOpen={confirmLogoutModal}
        onClose={() => setConfirmLogoutModal(false)}
        onConfirm={handleConfirmLogoutDevice}
        title={selectedDevice?.is_current_device ? "Logout Current Device?" : "Logout Another Device?"}
        description={
          selectedDevice?.is_current_device
            ? "You are about to log out of your current device session. You will need to log back in to access the LMS."
            : `Are you sure you want to log out "${selectedDevice?.device_name}" (${selectedDevice?.os}, ${selectedDevice?.browser})? Access will be revoked immediately.`
        }
        confirmText={selectedDevice?.is_current_device ? "Logout Current Device" : "Confirm Logout"}
        loading={actionLoading}
        variant="destructive"
      />

      {/* Confirmation Modal: Logout All Devices */}
      <ConfirmDialog
        isOpen={confirmLogoutAllModal}
        onClose={() => setConfirmLogoutAllModal(false)}
        onConfirm={handleConfirmLogoutAll}
        title="Logout All Devices?"
        description="Are you sure you want to log out from ALL active device sessions? All signed-in devices will lose access to the LMS immediately."
        confirmText="Logout All Devices"
        loading={actionLoading}
        variant="destructive"
      />
    </StudentLayout>
  );
}
