import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";
import { motion, useInView, useMotionValue, useSpring, useReducedMotion, animate } from "framer-motion";

const css = (n: string) => (typeof window === "undefined" ? "" : getComputedStyle(document.documentElement).getPropertyValue(n).trim());
const fine = () => typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Crosshair cursor */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!fine() || reduced()) return;
    document.body.classList.add("has-cursor");
    const el = ref.current!;
    let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y, raf = 0;
    const move = (e: PointerEvent) => {
      tx = e.clientX; ty = e.clientY;
      const t = e.target as HTMLElement;
      const field = t.closest("input,textarea,select");
      const hot = t.closest("a,button,[role=button]");
      el.style.opacity = field ? "0" : "1";
      el.dataset["hot"] = hot ? "1" : "0";
    };
    const tick = () => {
      x += (tx - x) * 0.2; y += (ty - y) * 0.2;
      el.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-50%)`;
      raf = requestAnimationFrame(tick);
    };
    addEventListener("pointermove", move); tick();
    return () => { removeEventListener("pointermove", move); cancelAnimationFrame(raf); document.body.classList.remove("has-cursor"); };
  }, []);
  return (
    <div ref={ref} aria-hidden data-hot="0" className="pointer-events-none fixed left-0 top-0 z-[100] hidden h-7 w-7 border border-foreground/70 opacity-0 transition-[width,height,border-color,background-color] duration-200 data-[hot=1]:h-12 data-[hot=1]:w-12 data-[hot=1]:border-primary data-[hot=1]:bg-primary/10 [@media(hover:hover)_and_(pointer:fine)]:block">
      <span className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 bg-primary" />
    </div>
  );
}

/* Dot-matrix canvas */
export function DotField() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!, ctx = c.getContext("2d")!;
    const mobile = !fine(), still = reduced();
    const gap = mobile ? 34 : 24, dpr = Math.min(devicePixelRatio, mobile ? 1 : 2);
    const acc = css("--primary") || "#c8ff3d", dim = css("--border") || "#25292d";
    let w = 0, h = 0, raf = 0, last = 0, px = -9999, py = -9999, scan = 0;
    const resize = () => { w = innerWidth; h = innerHeight; c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const mv = (e: PointerEvent) => { px = e.clientX; py = e.clientY; };
    const draw = (t: number) => {
      raf = requestAnimationFrame(draw);
      if (t - last < 16) return; last = t;
      ctx.clearRect(0, 0, w, h);
      scan = (scan + 0.6) % (h + 200);
      const R = 140;
      for (let y = gap / 2; y < h; y += gap) for (let x = gap / 2; x < w; x += gap) {
        const dx = x - px, dy = y - py, d = Math.hypot(dx, dy);
        const k = still ? 0 : Math.max(0, 1 - d / R);
        const ox = d ? (dx / d) * k * 10 : 0, oy = d ? (dy / d) * k * 10 : 0;
        const sk = still ? 0 : Math.max(0, 1 - Math.abs(y - (scan - 100)) / 60) * 0.5;
        ctx.globalAlpha = 0.5 + k * 0.5 + sk;
        ctx.fillStyle = k > 0.05 || sk > 0.2 ? acc : dim;
        const s = 1.2 + k * 2;
        ctx.fillRect(x + ox - s / 2, y + oy - s / 2, s, s);
      }
      if (still) cancelAnimationFrame(raf);
    };
    const vis = () => { cancelAnimationFrame(raf); if (!document.hidden) raf = requestAnimationFrame(draw); };
    resize(); addEventListener("resize", resize); addEventListener("pointermove", mv); document.addEventListener("visibilitychange", vis);
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", resize); removeEventListener("pointermove", mv); document.removeEventListener("visibilitychange", vis); };
  }, []);
  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-0 h-full w-full" />;
}

/* Boot loader */
export function BootLoader() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (sessionStorage.getItem("hs-boot") || reduced()) return;
    sessionStorage.setItem("hs-boot", "1"); setShow(true);
    const t = setTimeout(() => setShow(false), 900); return () => clearTimeout(t);
  }, []);
  if (!show) return null;
  return (
    <motion.div className="fixed inset-0 z-[200] grid place-items-center bg-background" initial={{ clipPath: "inset(0 0 0 0)" }} animate={{ clipPath: "inset(0 0 100% 0)" }} transition={{ delay: 0.6, duration: 0.35, ease: [0.7, 0, 0.3, 1] }}>
      <div className="w-48">
        <div className="font-mono text-xs uppercase tracking-widest text-primary">Hospitalityservis // boot</div>
        <motion.div className="mt-3 h-px bg-primary" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 0.55 }} />
      </div>
    </motion.div>
  );
}

/* Scroll progress */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const f = () => { const m = document.documentElement.scrollHeight - innerHeight; if (ref.current) ref.current.style.transform = `scaleX(${m > 0 ? scrollY / m : 0})`; };
    f(); addEventListener("scroll", f, { passive: true }); return () => removeEventListener("scroll", f);
  }, []);
  return <div ref={ref} className="fixed left-0 top-0 z-[90] h-px w-full origin-left scale-x-0 bg-primary" />;
}

/* Reveal */
export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const r = useReducedMotion();
  return (
    <motion.div className={className} initial={{ opacity: 0, y: r ? 0 : 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.6, delay, ease: [0.2, 0.7, 0.2, 1] }}>
      {children}
    </motion.div>
  );
}

/* Count up */
export function CountUp({ to, prefix = "", suffix = "" }: { to: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const r = useReducedMotion();
  useEffect(() => {
    if (!inView || !ref.current) return;
    if (r) { ref.current.textContent = prefix + to.toLocaleString() + suffix; return; }
    const c = animate(0, to, { duration: 1.4, ease: "easeOut", onUpdate: (v) => { if (ref.current) ref.current.textContent = prefix + Math.round(v).toLocaleString() + suffix; } });
    return () => c.stop();
  }, [inView, to, prefix, suffix, r]);
  return <span ref={ref}>{prefix}0{suffix}</span>;
}

/* Segmented score bar */
export function ScoreBar({ value, max = 5, segments = 20 }: { value: number; max?: number; segments?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const lit = Math.round((value / max) * segments);
  return (
    <div ref={ref} className="flex gap-[2px]">
      {Array.from({ length: segments }, (_, i) => (
        <motion.span key={i} className={`h-2 flex-1 ${i < lit ? "bg-primary" : "bg-muted"}`} initial={{ opacity: 0.15 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: i * 0.03 }} />
      ))}
    </div>
  );
}

/* Magnetic */
export function Magnetic({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 200, damping: 15 });
  const y = useSpring(useMotionValue(0), { stiffness: 200, damping: 15 });
  useEffect(() => {
    if (!fine() || reduced()) return;
    const f = (e: PointerEvent) => {
      const b = ref.current?.getBoundingClientRect(); if (!b) return;
      const dx = e.clientX - (b.left + b.width / 2), dy = e.clientY - (b.top + b.height / 2);
      const near = Math.abs(dx) < b.width / 2 + 80 && Math.abs(dy) < b.height / 2 + 80;
      x.set(near ? dx * 0.25 : 0); y.set(near ? dy * 0.25 : 0);
    };
    addEventListener("pointermove", f); return () => removeEventListener("pointermove", f);
  }, [x, y]);
  return <motion.div ref={ref} style={{ x, y }} className={`inline-block ${className ?? ""}`}>{children}</motion.div>;
}

/* Card: spotlight + optional tilt/glare + brackets */
export function Card({ children, className = "", tilt = false, style }: { children: ReactNode; className?: string; tilt?: boolean; style?: CSSProperties | undefined }) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useSpring(0, { stiffness: 150, damping: 15 }), ry = useSpring(0, { stiffness: 150, damping: 15 });
  const onMove = (e: React.PointerEvent) => {
    const el = ref.current!; const b = el.getBoundingClientRect();
    const px = (e.clientX - b.left) / b.width, py = (e.clientY - b.top) / b.height;
    el.style.setProperty("--mx", `${px * 100}%`); el.style.setProperty("--my", `${py * 100}%`);
    if (tilt && fine() && !reduced()) { ry.set((px - 0.5) * 12); rx.set(-(py - 0.5) * 12); }
  };
  const onLeave = () => { rx.set(0); ry.set(0); };
  return (
    <motion.div ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} style={{ rotateX: rx, rotateY: ry, transformPerspective: 900, ...(style as object) }}
      className={`group/card brackets border border-border bg-card ${className}`}>
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100" style={{ background: "radial-gradient(320px circle at var(--mx) var(--my), color-mix(in oklab, var(--primary) 12%, transparent), transparent 70%)" }} />
      {tilt && <div aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover/card:opacity-100" style={{ background: "radial-gradient(180px circle at var(--mx) var(--my), color-mix(in oklab, var(--foreground) 10%, transparent), transparent 60%)" }} />}
      <div className="relative">{children}</div>
    </motion.div>
  );
}

/* Scramble word */
const WORDS = ["Grows.", "Saves Money.", "Finds Partners.", "Wins Rush Hour."];
export function Scramble() {
  const [txt, setTxt] = useState(WORDS[0]!);
  useEffect(() => {
    if (reduced()) return;
    let i = 0, iv: ReturnType<typeof setInterval>;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#/%$";
    const next = () => {
      i = (i + 1) % WORDS.length; const target = WORDS[i]!; let f = 0;
      clearInterval(iv);
      iv = setInterval(() => {
        f++;
        setTxt(target.split("").map((ch, k) => (k < f / 2 || ch === " " ? ch : chars[Math.floor(Math.random() * chars.length)])).join(""));
        if (f / 2 >= target.length) clearInterval(iv);
      }, 30);
    };
    const t = setInterval(next, 2600);
    return () => { clearInterval(t); clearInterval(iv); };
  }, []);
  return <span className="text-primary">{txt}</span>;
}

/* Masked line */
export function MaskLine({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const r = useReducedMotion();
  return (
    <span className="block overflow-hidden pb-1">
      <motion.span className="block" initial={{ y: r ? 0 : "105%", opacity: r ? 0 : 1 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, delay, ease: [0.2, 0.7, 0.2, 1] }}>{children}</motion.span>
    </span>
  );
}

/* Hero nested squares */
export function HeroSquares() {
  const x = useSpring(0, { stiffness: 60, damping: 20 }), y = useSpring(0, { stiffness: 60, damping: 20 });
  const r = useReducedMotion();
  useEffect(() => {
    if (!fine() || reduced()) return;
    const f = (e: PointerEvent) => { x.set((e.clientX / innerWidth - 0.5) * 30); y.set((e.clientY / innerHeight - 0.5) * 30); };
    addEventListener("pointermove", f); return () => removeEventListener("pointermove", f);
  }, [x, y]);
  const sizes = [380, 300, 220, 140, 70];
  return (
    <motion.svg aria-hidden viewBox="-200 -200 400 400" className="pointer-events-none absolute left-1/2 top-1/2 h-[min(90vw,620px)] w-[min(90vw,620px)] -translate-x-1/2 -translate-y-1/2 opacity-40" style={{ x, y }}>
      {sizes.map((s, i) => (
        <motion.rect key={s} x={-s / 2} y={-s / 2} width={s} height={s} fill="none" stroke="var(--primary)" strokeOpacity={0.15 + i * 0.12} strokeWidth={1}
          className="pulse-outline" style={{ animationDelay: `${i * 0.4}s`, transformOrigin: "0 0" }}
          animate={r ? {} : { rotate: i % 2 ? -360 : 360 }} transition={{ duration: 60 - i * 8, repeat: Infinity, ease: "linear" }} />
      ))}
    </motion.svg>
  );
}

export function Marquee({ items }: { items: string[] }) {
  const list = [...items, ...items];
  return (
    <div className="overflow-hidden border-y border-border bg-card/60 py-4">
      <div className="animate-marquee flex w-max gap-10">
        {list.map((t, i) => (
          <span key={i} className="flex items-center gap-10 whitespace-nowrap font-mono text-sm uppercase tracking-widest text-muted-foreground">
            {t}<span className="h-1.5 w-1.5 bg-primary" />
          </span>
        ))}
      </div>
    </div>
  );
}
