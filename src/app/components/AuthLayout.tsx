import React from "react";
import { Logo } from "./Logo";

const AUTH_PANEL_IMG = "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=840&h=1400&fit=crop&auto=format";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      <div className="hidden lg:flex w-[420px] flex-col p-10 justify-between flex-shrink-0 relative overflow-hidden bg-slate-950">
        <img
          src={AUTH_PANEL_IMG}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-25 select-none pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-slate-950/80 pointer-events-none" />
        <div className="relative z-10">
          <Logo inverted />
        </div>
        <div className="relative z-10">
          <p className="text-white/40 text-[11px] uppercase tracking-[0.14em] mb-4 font-bold">Student review</p>
          <blockquote className="text-white text-[22px] leading-snug font-semibold tracking-tight">
            "Clear structure, zero fluff. The best technical course I've taken."
          </blockquote>
          <div className="flex items-center gap-3 mt-5">
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-xs font-bold text-white">
              PS
            </div>
            <div>
              <p className="text-white/80 text-sm font-medium">Priya Sharma</p>
              <p className="text-white/40 text-xs">Enrolled Nov 2024</p>
            </div>
          </div>
        </div>
        <p className="text-white/25 text-xs relative z-10">© 2025 NYTRC Learning Portal</p>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 min-h-screen lg:min-h-0">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <Logo />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
