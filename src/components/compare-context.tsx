import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

const STORAGE_KEY = "hs-compare";
type CompareContextValue = {
  selected: string[];
  toggle: (slug: string) => boolean;
  remove: (slug: string) => void;
  clear: () => void;
};
const CompareContext = createContext<CompareContextValue | null>(null);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<string[]>(() => {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(value) ? value.filter((item) => typeof item === "string").slice(0, 3) : [];
    } catch { return []; }
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(selected)); } catch { /* Selection still works in memory. */ }
  }, [selected]);

  const value = useMemo<CompareContextValue>(() => ({
    selected,
    toggle: (slug) => {
      if (selected.includes(slug)) {
        setSelected((items) => items.filter((item) => item !== slug));
        return true;
      }
      if (selected.length >= 3) return false;
      setSelected((items) => [...items, slug]);
      return true;
    },
    remove: (slug) => setSelected((items) => items.filter((item) => item !== slug)),
    clear: () => setSelected([]),
  }), [selected]);

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare() {
  const value = useContext(CompareContext);
  if (!value) throw new Error("useCompare must be used within CompareProvider");
  return value;
}
