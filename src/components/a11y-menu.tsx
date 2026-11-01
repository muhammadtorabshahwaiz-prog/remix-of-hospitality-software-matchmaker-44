import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Accessibility, Moon, RotateCcw, Sun, X } from "lucide-react";
import { getA11y, resetA11y, setA11y, subscribeA11y, TEXT_STEPS } from "@/lib/a11y";
import { getMode, getModeChoice, setModeChoice, subscribeTheme } from "@/lib/theme";

const useA11y = () => useSyncExternalStore(subscribeA11y, getA11y, getA11y);
const useMode = () => useSyncExternalStore(subscribeTheme, getMode, () => "dark" as const);
const useChoice = () => useSyncExternalStore(subscribeTheme, getModeChoice, () => "auto" as const);

/** Header button: flips light/dark and locks the choice. */
export function ModeToggle() {
  const mode = useMode();
  const next = mode === "light" ? "dark" : "light";
  return (
    <button type="button" onClick={() => setModeChoice(next)} aria-label={`Switch to ${next} mode`} title={`Switch to ${next} mode`} className="grid h-11 w-11 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary">
      {mode === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </button>
  );
}

function Switch({ label, hint, on, onChange }: { label: string; hint?: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)} className="flex w-full items-center justify-between gap-4 rounded-xl border border-border px-4 py-3 text-left transition-colors hover:border-primary">
      <span><span className="block text-sm font-semibold">{label}</span>{hint && <span className="block text-xs text-muted-foreground">{hint}</span>}</span>
      <span aria-hidden="true" className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? "bg-primary" : "bg-muted"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-background shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
      </span>
    </button>
  );
}

export function A11yMenu() {
  const [open, setOpen] = useState(false);
  const s = useA11y();
  const choice = useChoice();
  const panel = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); opener.current?.focus(); } };
    addEventListener("keydown", onKey);
    panel.current?.querySelector<HTMLElement>("button")?.focus();
    return () => removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button ref={opener} type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="a11y-panel" aria-label="Accessibility options" className="fixed bottom-4 left-4 z-[95] grid h-12 w-12 place-items-center rounded-full border border-border bg-card text-foreground shadow-lg transition-colors hover:border-primary hover:text-primary">
        <Accessibility className="h-5 w-5" />
      </button>
      {open && (
        <div ref={panel} id="a11y-panel" role="dialog" aria-label="Accessibility options" className="fixed bottom-20 left-4 z-[96] max-h-[calc(100dvh-7rem)] w-[min(92vw,22rem)] overflow-y-auto rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-2xl">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Accessibility</h2>
            <button type="button" onClick={() => { setOpen(false); opener.current?.focus(); }} aria-label="Close accessibility options" className="grid h-9 w-9 place-items-center rounded-full border border-border"><X className="h-4 w-4" /></button>
          </div>

          <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Appearance</p>
          <div role="radiogroup" aria-label="Colour mode" className="mt-2 grid grid-cols-3 gap-2">
            {([["auto", "Auto"], ["light", "Light"], ["dark", "Dark"]] as const).map(([v, label]) => (
              <button key={v} type="button" role="radio" aria-checked={choice === v} onClick={() => setModeChoice(v)} className={`min-h-11 rounded-xl border text-sm font-semibold transition-colors ${choice === v ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary"}`}>{label}</button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Light or Dark stays until you change it. Auto lets the core explosions switch it.</p>

          <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Text size: {TEXT_STEPS[s.textSize]}%</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            <button type="button" disabled={s.textSize === 0} onClick={() => setA11y({ textSize: (s.textSize - 1) as 0 | 1 | 2 | 3 })} aria-label="Smaller text" className="min-h-11 rounded-xl border border-border text-sm font-semibold disabled:opacity-40">A-</button>
            <button type="button" onClick={() => setA11y({ textSize: 0 })} className="min-h-11 rounded-xl border border-border text-sm font-semibold">Reset</button>
            <button type="button" disabled={s.textSize === 3} onClick={() => setA11y({ textSize: (s.textSize + 1) as 0 | 1 | 2 | 3 })} aria-label="Larger text" className="min-h-11 rounded-xl border border-border text-sm font-semibold disabled:opacity-40">A+</button>
          </div>

          <div className="mt-5 space-y-2">
            <Switch label="High contrast" hint="Stronger text and borders" on={s.contrast} onChange={(v) => setA11y({ contrast: v })} />
            <Switch label="Reduce motion" hint="Stops transitions and slows the core" on={s.calm} onChange={(v) => setA11y({ calm: v })} />
            <Switch label="Readable font" hint="Clearer letters, wider spacing" on={s.readable} onChange={(v) => setA11y({ readable: v })} />
            <Switch label="Stop glitch and cursor effects" hint="Plain cursor, no screen glitches" on={s.noFx} onChange={(v) => setA11y({ noFx: v })} />
          </div>

          <button type="button" onClick={() => { resetA11y(); setModeChoice("auto"); }} className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-border text-sm font-semibold hover:border-primary"><RotateCcw className="h-4 w-4" />Reset all</button>
        </div>
      )}
    </>
  );
}
