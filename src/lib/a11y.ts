// Accessibility preferences. Saved in the browser, applied to <html> as data attributes (styled in index.css).
// The light/dark choice itself lives in theme.ts so it can lock the mode against core explosions.

export type A11y = { textSize: 0 | 1 | 2 | 3; contrast: boolean; calm: boolean; readable: boolean; noFx: boolean };
export const TEXT_STEPS = [100, 112, 125, 150] as const;
const KEY = "hs-a11y-v1";
const DEFAULTS: A11y = { textSize: 0, contrast: false, calm: false, readable: false, noFx: false };

function load(): A11y {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "null");
    if (v && typeof v === "object") return { ...DEFAULTS, ...v, textSize: [0, 1, 2, 3].includes(v.textSize) ? v.textSize : 0 };
  } catch { /* ignore */ }
  return { ...DEFAULTS };
}

let state: A11y = typeof localStorage === "undefined" ? { ...DEFAULTS } : load();
const subs = new Set<() => void>();

function apply() {
  if (typeof document === "undefined") return;
  const r = document.documentElement;
  r.style.fontSize = `${TEXT_STEPS[state.textSize]}%`;
  r.dataset.contrast = state.contrast ? "1" : "0";
  r.dataset.calm = state.calm ? "1" : "0";
  r.dataset.readable = state.readable ? "1" : "0";
  r.dataset.nofx = state.noFx ? "1" : "0";
}
apply();

export const getA11y = () => state;
export const subscribeA11y = (fn: () => void) => { subs.add(fn); return () => { subs.delete(fn); }; };

export function setA11y(patch: Partial<A11y>) {
  state = { ...state, ...patch };
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  apply();
  subs.forEach((fn) => fn());
}
export const resetA11y = () => setA11y({ ...DEFAULTS });
