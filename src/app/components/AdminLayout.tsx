import React, { useState } from "react";
import { Menu } from "lucide-react";
import { Screen } from "../../data/types";
import { cn } from "./Button";
import { AdminSidebar } from "./AdminSidebar";
import { Logo } from "./Logo";
import { DarkToggle } from "./DarkToggle";

export function AdminLayout({
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
      {/* Desktop sidebar */}
      <div
        className={cn(
          "hidden md:flex flex-col fixed inset-y-0 left-0 z-30 transition-all duration-250",
          collapsed ? "w-[72px]" : "w-[260px]"
        )}
      >
        <AdminSidebar
          current={current}
          onNavigate={onNavigate}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((c) => !c)}
        />
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0">
            <AdminSidebar
              current={current}
              onNavigate={onNavigate}
              collapsed={false}
              onClose={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-250",
          collapsed ? "md:ml-[72px]" : "md:ml-[260px]"
        )}
      >
        <div className="md:hidden flex items-center h-14 px-4 bg-card/95 backdrop-blur-md border-b border-border gap-3 flex-shrink-0 sticky top-0 z-20 shadow-sm">
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-muted transition-colors -ml-1">
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
