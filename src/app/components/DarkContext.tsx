import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export const DarkCtx = createContext<{ dark: boolean; toggle: () => void }>({
  dark: false,
  toggle: () => {},
});

export function useDark() {
  return useContext(DarkCtx);
}

export function DarkProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("lms_theme_dark");
        if (stored !== null) {
          return JSON.parse(stored);
        }
        return document.documentElement.classList.contains("dark");
      } catch {
        return false;
      }
    }
    return false;
  });

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", dark);
      try {
        localStorage.setItem("lms_theme_dark", JSON.stringify(dark));
      } catch (e) {
        console.error("Failed to save theme in localStorage:", e);
      }
    }
  }, [dark]);

  function toggle() {
    setDark((prev) => !prev);
  }

  return (
    <DarkCtx.Provider value={{ dark, toggle }}>
      {children}
    </DarkCtx.Provider>
  );
}
