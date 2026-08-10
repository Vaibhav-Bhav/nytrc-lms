import React, { useState } from "react";
import { Search, Bell, User, LogOut, Menu, ChevronDown, Sparkles, Check } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { DarkToggle } from "./DarkToggle";
import { cn } from "./Button";
import { toast } from "sonner";
import { useAuth } from "../../hooks/useAuth";

export function Header({
  onOpenMobileMenu,
  role = "Student",
  userName,
  userEmail,
}: {
  onOpenMobileMenu?: () => void;
  role?: "Student" | "Admin";
  userName?: string;
  userEmail?: string;
}) {
  const { data: user } = useAuth();
  const navigate = useNavigate();

  const actualRole = user?.role === "admin" ? "Admin" : (role || "Student");
  const actualName = user?.name || (actualRole === "Admin" ? "Admin User" : "Student User");
  const actualEmail = user?.email || (actualRole === "Admin" ? "admin@nytrc.org" : "student@example.com");
  const initials = actualName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() || (actualRole === "Admin" ? "AD" : "ST");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notificationsRead, setNotificationsRead] = useState(false);

  const notifications = [
    { id: 1, title: "Course Updated", desc: "Module 3: Fleet Safety Management added new materials", time: "10m ago" },
    { id: 2, title: "Invoice Paid", desc: "Receipt #INV-2026-004 generated successfully", time: "1h ago" },
    { id: 3, title: "Welcome to NYTRC", desc: "Your enrollment is complete. Start learning now!", time: "1d ago" },
  ];

  async function handleLogout() {
    setShowProfileMenu(false);
    setShowNotifications(false);
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        if (res.status !== 404) {
          toast.error(d.error ?? "Logout failed. Please try again.");
          return;
        }
      }
      toast.success("Signed out successfully.");
    } catch {
      toast.error("Network error during logout.");
    } finally {
      navigate({ to: "/login" });
    }
  }

  return (
    <header className="h-[68px] bg-card border-b border-border px-4 md:px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs transition-colors duration-200">
      {/* Left side: Mobile menu toggle + Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-xl text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
            aria-label="Open sidebar navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses, lessons, resources..."
            className="w-full h-10 pl-10 pr-12 text-sm bg-muted/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1.5 py-0.5 bg-muted border border-border rounded text-[10px] font-semibold text-muted-foreground select-none">
            <span>⌘</span>
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Right side: Actions & User Dropdown */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Dark Mode Toggle */}
        <DarkToggle />

        {/* Notifications Button & Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="relative p-2.5 rounded-xl text-muted-foreground hover:bg-muted transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {!notificationsRead && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary ring-2 ring-card animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm text-foreground">Notifications</h4>
                  <span className="px-2 py-0.5 bg-primary-light text-primary text-xs font-semibold rounded-full">
                    {notificationsRead ? 0 : 3} new
                  </span>
                </div>
                <button
                  onClick={() => {
                    setNotificationsRead(true);
                    toast.success("Marked all as read");
                  }}
                  className="text-xs font-medium text-primary hover:underline cursor-pointer"
                >
                  Mark read
                </button>
              </div>

              <div className="divide-y divide-border max-h-80 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-3.5 hover:bg-muted/50 transition-colors cursor-pointer group"
                    onClick={() => {
                      setShowNotifications(false);
                      if (role === "Student") navigate({ to: "/student/courses" as "/" });
                      else navigate({ to: "/admin/email-log" as "/" });
                    }}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                        {n.title}
                      </p>
                      <span className="text-[10px] text-muted-foreground">{n.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-snug">{n.desc}</p>
                  </div>
                ))}
              </div>

              <div className="p-2.5 bg-muted/30 border-t border-border text-center">
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    if (role === "Student") navigate({ to: "/student/account" as "/" });
                    else navigate({ to: "/admin/email-log" as "/" });
                  }}
                  className="text-xs font-medium text-muted-foreground hover:text-primary cursor-pointer"
                >
                  View all activity →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Vertical Divider */}
        <div className="h-6 w-[1px] bg-border mx-1" />

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-muted transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center shadow-xs">
              {initials}
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-semibold text-foreground leading-tight">{actualName}</span>
              <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-primary" />
                {actualRole}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-200" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-60 bg-card border border-border rounded-2xl shadow-xl z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-3 py-2.5 mb-1 border-b border-border">
                <p className="text-xs font-semibold text-foreground">{actualName}</p>
                <p className="text-[11px] text-muted-foreground truncate">{actualEmail}</p>
              </div>

              <div className="space-y-0.5">
                {actualRole === "Student" ? (
                  <>
                    <Link
                      to="/student/account"
                      onClick={() => setShowProfileMenu(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-foreground hover:bg-muted rounded-xl transition-colors cursor-pointer text-left"
                    >
                      <User className="w-4 h-4 text-primary" />
                      Account & Invoices
                    </Link>
                    <Link
                      to="/student/courses"
                      onClick={() => setShowProfileMenu(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-foreground hover:bg-muted rounded-xl transition-colors cursor-pointer text-left"
                    >
                      <Sparkles className="w-4 h-4 text-warning-foreground" />
                      My Learning Path
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setShowProfileMenu(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-foreground hover:bg-muted rounded-xl transition-colors cursor-pointer text-left"
                    >
                      <User className="w-4 h-4 text-primary" />
                      Admin Control Panel
                    </Link>
                    <Link
                      to="/admin/create-course"
                      onClick={() => setShowProfileMenu(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-foreground hover:bg-muted rounded-xl transition-colors cursor-pointer text-left"
                    >
                      <Sparkles className="w-4 h-4 text-success-foreground" />
                      Create New Course
                    </Link>
                  </>
                )}
              </div>

              <div className="my-1 border-t border-border" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-error-foreground hover:bg-error-light rounded-xl transition-colors cursor-pointer text-left"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
