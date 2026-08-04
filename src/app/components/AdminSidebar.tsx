import React from "react";
import { BarChart2, BookOpen, Users, X, Shield, LogOut } from "lucide-react";
import { Screen } from "../../data/types";
import { cn } from "./Button";
import { Logo } from "./Logo";
import { DarkToggle } from "./DarkToggle";

export function AdminSidebar({
  current,
  onNavigate,
  onClose,
}: {
  current: Screen;
  onNavigate: (s: Screen) => void;
  onClose?: () => void;
}) {
  const items: [Screen, string, React.ElementType][] = [
    ["admin-dashboard", "Dashboard", BarChart2],
    ["admin-content", "Content", BookOpen],
    ["admin-students", "Students", Users],
  ];

  return (
    <aside className="w-56 bg-card border-r border-border flex flex-col h-full">
      <div className="h-14 flex items-center justify-between px-4 border-b border-border flex-shrink-0">
        <Logo />
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors md:hidden">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>
      <nav className="flex-1 p-3 flex flex-col gap-0.5 overflow-y-auto">
        {items.map(([id, label, Icon]) => {
          const active =
            current === id ||
            (current === "admin-student-detail" && id === "admin-students") ||
            (current === "admin-refund" && id === "admin-students") ||
            (current === "admin-create-course" && id === "admin-dashboard");
          return (
            <button
              key={id}
              onClick={() => {
                onNavigate(id);
                onClose?.();
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          );
        })}
      </nav>
      <div className="p-3 border-t border-border flex-shrink-0">
        <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Shield className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">Admin</p>
            <p className="text-xs text-muted-foreground truncate">admin@learnbase.io</p>
          </div>
        </div>
        <div className="px-1 mb-1">
          <DarkToggle label />
        </div>
        <button
          onClick={() => onNavigate("login")}
          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Log out
        </button>
      </div>
    </aside>
  );
}
