import { Sun, Moon } from "lucide-react";
import { useDark } from "./DarkContext";

export function DarkToggle({ label = false }: { label?: boolean }) {
  const { dark, toggle } = useDark();
  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      {label && <span className="text-xs">{dark ? "Light mode" : "Dark mode"}</span>}
    </button>
  );
}
