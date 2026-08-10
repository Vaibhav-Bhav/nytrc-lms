import React, { useState } from "react";
import { cn } from "./Button";
import { AdminSidebar } from "./AdminSidebar";
import { Header } from "./Header";

export function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background transition-colors duration-200">
      {/* Desktop & Tablet Sidebar */}
      <div
        className={cn(
          "hidden md:flex flex-col fixed inset-y-0 left-0 z-30 transition-all duration-300 ease-in-out",
          collapsed ? "w-[72px]" : "w-[260px]"
        )}
      >
        <AdminSidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((c) => !c)}
        />
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[260px] animate-in slide-in-from-left duration-300">
            <AdminSidebar
              collapsed={false}
              onClose={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Content Area */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out",
          collapsed ? "md:ml-[72px]" : "md:ml-[260px]"
        )}
      >
        {/* Top Header */}
        <Header
          onOpenMobileMenu={() => setMobileOpen(true)}
          role="Admin"
        />

        {/* Page Content */}
        <div className="flex-1 bg-background transition-colors duration-200">
          {children}
        </div>
      </div>
    </div>
  );
}
