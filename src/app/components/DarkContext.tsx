import { createContext, useContext } from "react";

export const DarkCtx = createContext<{ dark: boolean; toggle: () => void }>({
  dark: false,
  toggle: () => {},
});

export function useDark() {
  return useContext(DarkCtx);
}
