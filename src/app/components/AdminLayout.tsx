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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex min-h-screen">
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex transition-transform duration-200",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <AdminSidebar current={current} onNavigate={onNavigate} onClose={() => setSidebarOpen(false)} />
      </div>
      <div className="flex-1 md:ml-56 flex flex-col min-w-0">
        <div className="md:hidden flex items-center h-14 px-4 bg-card border-b border-border gap-3 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-muted transition-colors">
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
