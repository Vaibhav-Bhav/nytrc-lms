import React, { useState } from "react";
import { Menu, PanelLeftOpen, PanelLeftClose } from "lucide-react";
import { Screen } from "../../data/types";
import { cn } from "./Button";
import { StudentSidebar } from "./StudentSidebar";
import { Logo } from "./Logo";

export function StudentLayout({
  children,
  current,
  onNavigate,
}: {
  children: React.ReactNode;
  current: Screen;
  onNavigate: (s: Screen) => void;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Vertical Sliding Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex transition-transform duration-300 ease-in-out md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <StudentSidebar
          current={current}
          onNavigate={onNavigate}
          onClose={() => setSidebarOpen(false)}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((c) => !c)}
        />
      </div>

      {/* Main Content Area */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300",
          collapsed ? "md:ml-16" : "md:ml-60"
        )}
      >
        {/* Top Header Bar */}
        <header className="h-16 bg-card border-b border-border flex items-center px-4 md:px-6 gap-3 sticky top-0 z-30 flex-shrink-0 shadow-xs">
          {/* Mobile hamburger button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-lg hover:bg-muted text-foreground transition-colors -ml-1"
            aria-label="Open navigation sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="hidden md:flex items-center gap-2 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title={collapsed ? "Expand navigation sidebar" : "Collapse navigation sidebar"}
          >
            {collapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </button>

          {/* Full logo in header when sidebar is collapsed or on mobile */}
          {collapsed && (
            <div className="hidden md:flex items-center gap-2 transition-all ml-1">
              <Logo />
            </div>
          )}

          <div className="flex md:hidden items-center gap-2">
            <Logo />
          </div>


        </header>

        {/* Screen Content */}
        <div className="flex-1 flex flex-col min-h-0">{children}</div>
      </div>
    </div>
  );
}
