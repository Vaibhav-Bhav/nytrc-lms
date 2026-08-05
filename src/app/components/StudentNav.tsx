import React from "react";
import { Screen } from "../../data/types";
import { StudentLayout } from "./StudentLayout";

export function StudentNav({
  current,
  onNavigate,
  children,
}: {
  current: Screen;
  onNavigate: (s: Screen) => void;
  children?: React.ReactNode;
}) {
  return (
    <StudentLayout current={current} onNavigate={onNavigate}>
      {children}
    </StudentLayout>
  );
}

export { StudentLayout };
