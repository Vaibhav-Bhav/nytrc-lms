import React from "react";
import { Logo } from "./Logo";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      <div className="hidden lg:flex w-[420px] bg-indigo-800 flex-col p-10 justify-between flex-shrink-0">
        <Logo inverted />
        <div>
          <p className="text-white/30 text-xs uppercase tracking-widest mb-4 font-medium">Student review</p>
          <blockquote className="text-white text-xl leading-relaxed font-medium">
            "Clear structure, zero fluff. The best technical course I've taken."
          </blockquote>
          <p className="text-white/50 mt-4 text-sm">Priya Sharma — enrolled Nov 2024</p>
        </div>
        <p className="text-white/30 text-xs">© 2025 NYtrc LMS</p>
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
