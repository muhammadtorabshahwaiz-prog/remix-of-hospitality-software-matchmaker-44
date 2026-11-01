// Global theme store. One theme drives the whole site: CSS colour tokens (light or dark), the bits/glitch
// backdrop, the world map, the electric cursor, the core animation's accent.
// The core's explosion calls setTheme(next): the accent hue glides to the new colour and the site
// switches between its light and dark looks. The cursor position nudges the hue a few degrees
// (setDrift) so the UI feels alive. There is deliberately no on-page colour switch.

export type Mode = "light" | "dark";
export type Theme = { id: string; name: string; hsl: number; ok: number; mode: Mode };

// hsl = hue used by canvases, ok = the same colour as an OKLCH hue for CSS tokens.
export const THEMES: Theme[] = [
  { id: "azure", name: "Azure", hsl: 221, ok: 262, mode: "light" },
  { id: "midnight", name: "Midnight Cyan", hsl: 192, ok: 212, mode: "dark" },
  { id: "violet", name: "Violet", hsl: 262, ok: 292, mode: "light" },
  { id: "emerald", name: "Emerald Signal", hsl: 150, ok: 155, mode: "dark" },
  { id: "coral", name: "Coral", hsl: 345, ok: 15, mode: "light" },
  { id: "amber", name: "Amber Forge", hsl: 40, ok: 72, mode: "dark" },
];

const KEY = "hs-theme-v2";
const N = THEMES.length;
const wrap = (d: number) => ((d % 360) + 360) % 360;
const lerpAngle = (a: number, b: number, e: number) => wrap(a + (((b - a + 540) % 360) - 180) * e);

function load(): number {
  try {
    const v = Number(localStorage.getItem(KEY));
    return Number.isInteger(v) && v >= 0 && v < N ? v : 0;
  } catch { return 0; }
}

// Dark/white rhythm: the site stays in one mode for 4-5 core explosions (cycling through every accent colour),
// then switches to the other mode for the next 4-5, and so on.
const PKEY = "hs-phase-v3";
const phaseLen = () => 4 + Math.floor(Math.random() * 2);
function loadPhase(): { mode: Mode; left: number } {
  try {
    const v = JSON.parse(localStorage.getItem(PKEY) || "null");
    if (v && (v.mode === "dark" || v.mode === "light") && Number.isInteger(v.left) && v.left > 0) return v;
  } catch { /* ignore */ }
  return { mode: "dark", left: phaseLen() };
}
let phase = loadPhase();
let index = load();
// A visitor's own Light/Dark choice (from the accessibility menu or header toggle) locks the mode;
// core explosions then only change the accent colour. null = Auto (the explosion rhythm decides).
const MKEY = "hs-mode-v3";
function loadChoice(): Mode | null {
  try { const v = localStorage.getItem(MKEY); return v === "light" || v === "dark" ? v : null; } catch { return null; }
}
let choice: Mode | null = loadChoice();
let modeNow: Mode = choice ?? phase.mode;
const base = { hsl: THEMES[index]!.hsl, ok: THEMES[index]!.ok };
let tween: { t0: number; dur: number; fromHsl: number; fromOk: number; toHsl: number; toOk: number } | null = null;
let drift = 0, driftTarget = 0, lastCss = 0, lastApplied = NaN, raf = 0;
const subs = new Set<() => void>();
const reduced = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Writes the colour tokens used by Tailwind (oklch triplets) for the current mode. */
function apply(okHue: number) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const s = root.style;
  const H = wrap(okHue).toFixed(1);
  const light = modeNow === "light";
  root.dataset.mode = modeNow;
  root.classList.toggle("dark", !light);
  root.style.colorScheme = light ? "light" : "dark";
  const set = (k: string, v: string) => s.setProperty(k, v);
  set("--theme-h", H);
  if (light) {
    set("--background", `0.985 0.005 ${H}`);
    set("--foreground", `0.22 0.04 ${H}`);
    set("--card", `1 0 0`);
    set("--card-foreground", `0.22 0.04 ${H}`);
    set("--popover", `1 0 0`);
    set("--popover-foreground", `0.22 0.04 ${H}`);
    set("--primary", `0.52 0.2 ${H}`);
    set("--primary-foreground", `0.99 0 0`);
    set("--secondary", `0.965 0.014 ${H}`);
    set("--secondary-foreground", `0.25 0.04 ${H}`);
    set("--muted", `0.965 0.014 ${H}`);
    set("--muted-foreground", `0.5 0.03 ${H}`);
    set("--accent", `0.95 0.03 ${H}`);
    set("--accent-foreground", `0.25 0.05 ${H}`);
    set("--border", `0.915 0.015 ${H}`);
    set("--input", `0.9 0.018 ${H}`);
    set("--paper", `0.965 0.018 ${H}`);
    set("--paper-foreground", `0.22 0.04 ${H}`);
    set("--paper-300", `0.9 0.02 ${H}`);
    set("--ink-700", `0.46 0.035 ${H}`);
    set("--rose-500", `0.52 0.2 ${H}`);
    set("--rose-700", `0.42 0.18 ${H}`);
  } else {
    set("--background", `0.17 0.028 ${H}`);
    set("--foreground", `0.97 0.006 ${H}`);
    set("--card", `0.215 0.032 ${H}`);
    set("--card-foreground", `0.97 0.006 ${H}`);
    set("--popover", `0.215 0.032 ${H}`);
    set("--popover-foreground", `0.97 0.006 ${H}`);
    set("--primary", `0.7 0.16 ${H}`);
    set("--primary-foreground", `0.16 0.03 ${H}`);
    set("--secondary", `0.255 0.034 ${H}`);
    set("--secondary-foreground", `0.97 0.006 ${H}`);
    set("--muted", `0.255 0.034 ${H}`);
    set("--muted-foreground", `0.74 0.03 ${H}`);
    set("--accent", `0.29 0.045 ${H}`);
    set("--accent-foreground", `0.97 0.006 ${H}`);
    set("--border", `0.31 0.035 ${H}`);
    set("--input", `0.34 0.04 ${H}`);
    set("--paper", `0.95 0.02 ${H}`);
    set("--paper-foreground", `0.2 0.035 ${H}`);
    set("--paper-300", `0.86 0.03 ${H}`);
    set("--ink-700", `0.42 0.04 ${H}`);
    set("--rose-500", `0.7 0.16 ${H}`);
    set("--rose-700", `0.58 0.17 ${H}`);
  }
  set("--ring", "var(--primary)");
  set("--sidebar-background", "var(--card)");
  set("--sidebar-foreground", "var(--foreground)");
  set("--sidebar-primary", "var(--primary)");
  set("--sidebar-primary-foreground", "var(--primary-foreground)");
  set("--sidebar-accent", "var(--accent)");
  set("--sidebar-accent-foreground", "var(--accent-foreground)");
  set("--sidebar-border", "var(--border)");
  set("--sidebar-ring", "var(--primary)");
}

function tick(now: number) {
  raf = 0;
  let busy = false;
  if (tween) {
    const u = Math.min(1, (now - tween.t0) / tween.dur), e = 1 - Math.pow(1 - u, 3);
    base.hsl = lerpAngle(tween.fromHsl, tween.toHsl, e);
    base.ok = lerpAngle(tween.fromOk, tween.toOk, e);
    if (u >= 1) tween = null; else busy = true;
  }
  const dd = driftTarget - drift;
  if (Math.abs(dd) > 0.02) { drift += dd * 0.12; busy = true; } else drift = driftTarget;
  // CSS tokens re-style the whole page, so cap the rate (canvases read getVisual() every frame anyway).
  if (now - lastCss > 42 || !busy) {
    const k = Math.round((base.ok + drift) * 4) / 4;
    if (k !== lastApplied) { apply(k); lastApplied = k; }
    lastCss = now;
  }
  if (busy) raf = requestAnimationFrame(tick);
}
const kick = () => { if (!raf && typeof requestAnimationFrame === "function") raf = requestAnimationFrame(tick); };

apply(base.ok);
lastApplied = Math.round(base.ok * 4) / 4;

export const getThemeIndex = () => index;
export const getTheme = () => THEMES[index]!;
export const getMode = (): Mode => modeNow;
export const subscribeTheme = (fn: () => void) => { subs.add(fn); return () => { subs.delete(fn); }; };

/** Current animated colour, including the cursor drift, and whether the site is light or dark. */
export function getVisual() {
  const h = wrap(base.hsl + drift);
  return { hsl: h, hsl2: wrap(h + 42), ok: wrap(base.ok + drift), mode: modeNow };
}

export function setTheme(next: number) {
  const n = ((next % N) + N) % N;
  if (n === index) return;
  index = n;
  try { localStorage.setItem(KEY, String(n)); } catch { /* ignore */ }
  const to = THEMES[n]!;
  modeNow = choice ?? phase.mode;
  if (reduced()) { base.hsl = to.hsl; base.ok = to.ok; tween = null; }
  else tween = { t0: performance.now(), dur: 1700, fromHsl: base.hsl, fromOk: base.ok, toHsl: to.hsl, toOk: to.ok };
  lastApplied = NaN; // force the new mode's tokens to be written on the next tick
  kick();
  subs.forEach((fn) => fn());
}

export const getModeChoice = (): Mode | "auto" => choice ?? "auto";
export function setModeChoice(next: Mode | "auto") {
  choice = next === "auto" ? null : next;
  try { if (choice) localStorage.setItem(MKEY, choice); else localStorage.removeItem(MKEY); } catch { /* ignore */ }
  modeNow = choice ?? phase.mode;
  lastApplied = NaN;
  kick();
  subs.forEach((fn) => fn());
}

/** Called by each core explosion: next accent colour, and a mode switch after every 4-5 explosions. */
export function advanceTheme() {
  phase = { ...phase, left: phase.left - 1 };
  if (phase.left <= 0) phase = { mode: phase.mode === "dark" ? "light" : "dark", left: phaseLen() };
  try { localStorage.setItem(PKEY, JSON.stringify(phase)); } catch { /* ignore */ }
  setTheme(index + 1);
}

/** -1..1 from the cursor's horizontal position; shifts the hue by up to ±10°. */
export function setDrift(nx: number) {
  driftTarget = reduced() ? 0 : Math.max(-1, Math.min(1, nx)) * 10;
  kick();
}
