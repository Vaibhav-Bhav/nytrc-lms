import { useState } from "react";
import { Menu, User, LogOut, X } from "lucide-react";
import { Screen } from "../../data/types";
import { cn } from "./Button";
import { Logo } from "./Logo";
import { DarkToggle } from "./DarkToggle";

export function StudentNav({ current, onNavigate }: { current: Screen; onNavigate: (s: Screen) => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems: [Screen, string][] = [
    ["student-dashboard", "Dashboard"],
    ["student-courses", "My Courses"],
    ["student-account", "Account"],
  ];

  return (
    <>
      <header className="h-14 bg-card border-b border-border flex items-center px-4 gap-3 sticky top-0 z-30">
        <button
          onClick={() => setMobileOpen(true)}
          className="sm:hidden p-2 rounded-lg hover:bg-muted transition-colors -ml-1"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5 text-foreground" />
        </button>
        <Logo />
        <nav className="hidden sm:flex flex-1 items-center gap-0.5 ml-2">
          {navItems.map(([id, label]) => (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                current === id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-1 ml-auto">
          <DarkToggle />
          <button
            onClick={() => onNavigate("student-account")}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
              current === "student-account"
                ? "bg-primary text-primary-foreground"
                : "bg-primary/10 text-primary hover:bg-primary/20"
            )}
          >
            <User className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate("login")}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-card border-r border-border flex flex-col shadow-2xl">
            <div className="flex items-center justify-between h-14 px-4 border-b border-border flex-shrink-0">
              <Logo />
              <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <nav className="flex-1 p-3 flex flex-col gap-0.5 overflow-y-auto">
              {navItems.map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => {
                    onNavigate(id);
                    setMobileOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left",
                    current === id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {label}
                </button>
              ))}
            </nav>
            <div className="p-3 border-t border-border space-y-1">
              <DarkToggle label />
              <button
                onClick={() => {
                  onNavigate("login");
                  setMobileOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
