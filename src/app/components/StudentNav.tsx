import React, { useState } from "react";
import { Menu, User, LogOut } from "lucide-react";
import { Screen } from "../../data/types";
import { cn } from "./Button";
import { Logo } from "./Logo";
import { DarkToggle } from "./DarkToggle";
import { StudentSidebar } from "./StudentSidebar";

export function StudentNav({ current, onNavigate }: { current: Screen; onNavigate: (s: Screen) => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="h-16 bg-card border-b border-border flex items-center px-4 md:px-6 gap-3 sticky top-0 z-30 shadow-sm">
        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors -ml-1 cursor-pointer"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5 text-foreground" />
        </button>
        <Logo />
        <div className="flex items-center gap-2 ml-auto">
          <DarkToggle />
          <button
            onClick={() => onNavigate("student-account")}
            className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center transition-all duration-150 ring-2 ring-primary/20 cursor-pointer",
              current === "student-account"
                ? "bg-primary text-primary-foreground"
                : "bg-primary/10 text-primary hover:bg-primary/20"
            )}
            title="Account Settings"
          >
            <User className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate("login")}
            className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[260px]">
            <StudentSidebar current={current} onNavigate={onNavigate} onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}

export function StudentLayout({
  children,
  current,
  onNavigate,
}: {
  children: React.ReactNode;
  current: Screen;
  onNavigate: (s: Screen) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop & Tablet Sidebar */}
      <div
        className={cn(
          "hidden md:flex flex-col fixed inset-y-0 left-0 z-30 transition-all duration-250",
          collapsed ? "w-[72px]" : "w-[260px]"
        )}
      >
        <StudentSidebar
          current={current}
          onNavigate={onNavigate}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((c) => !c)}
        />
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0">
            <StudentSidebar current={current} onNavigate={onNavigate} collapsed={false} onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-250",
          collapsed ? "md:ml-[72px]" : "md:ml-[260px]"
        )}
      >
        <div className="md:hidden flex items-center h-14 px-4 bg-card/95 backdrop-blur-md border-b border-border gap-3 flex-shrink-0 sticky top-0 z-20 shadow-sm">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-muted transition-colors -ml-1 cursor-pointer"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <Logo />
          <div className="ml-auto">
            <DarkToggle />
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
